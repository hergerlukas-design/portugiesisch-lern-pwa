import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from './components/Navigation';
import { CategorySelector } from './components/CategorySelector';
import { DirectionToggle } from './components/DirectionToggle';
import { StudyMode } from './components/StudyMode';
import { StatsComponent } from './components/Stats';
import { Settings } from './components/Settings';
import { useProgress } from './lib/useProgress';
import { applyTheme, loadTheme, saveTheme } from './lib/theme';
import {
  getOrCreateDailyTask,
  isDailyTaskDone,
  markDailyTaskCompleted,
  nextDailyLevel,
  type DailyTask,
} from './lib/dailyTask';
import { getWordIds, getWordsByCategory } from './data/words';
import type { Card, Direction, Level, Outcome, Theme } from './types';

const DIRECTION_KEY = 'studyDirection';

const LEVEL_LABELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Anfänger' },
  { id: 'advanced', label: 'Fortgeschritten' },
];
const LEVEL_KEY = 'studyLevel';

// Saved choice if it is one of `allowed`, else the first allowed value
function loadSetting<T extends string>(key: string, allowed: T[]): T {
  try {
    const stored = localStorage.getItem(key);
    return allowed.find((value) => value === stored) ?? allowed[0];
  } catch {
    return allowed[0];
  }
}

function saveSetting(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preference just won't persist
  }
}

function App() {
  const [currentMode, setCurrentMode] = useState<'home' | 'study' | 'stats' | 'settings'>('home');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'top100' | 'top500' | 'top1000'>('top100');
  // Cards of the running session, fixed at start so ratings don't reshuffle it
  const [session, setSession] = useState<{ cards: Card[]; daily: boolean; level: Level } | null>(null);
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
  // Words already recorded in this daily session (only the first answer counts for SM-2)
  const recordedInSession = useRef(new Set<string>());
  const [direction, setDirection] = useState<Direction>(() =>
    loadSetting<Direction>(DIRECTION_KEY, ['de-pt', 'pt-de'])
  );
  const [level, setLevel] = useState<Level>(() =>
    loadSetting<Level>(LEVEL_KEY, ['beginner', 'advanced'])
  );

  const handleDirectionChange = (newDirection: Direction) => {
    setDirection(newDirection);
    saveSetting(DIRECTION_KEY, newDirection);
  };

  const [theme, setTheme] = useState<Theme>(loadTheme);

  useEffect(() => applyTheme(theme), [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleLevelChange = (newLevel: Level) => {
    setLevel(newLevel);
    saveSetting(LEVEL_KEY, newLevel);
  };

  const {
    cards,
    isLoaded,
    initializeCards,
    recordProgress,
    getCardsForReview,
    getStats,
    resetAllProgress,
  } = useProgress();

  // Initialize cards when app loads
  useEffect(() => {
    if (isLoaded && cards.length === 0) {
      // Initialize with top 100 words
      const wordIds = getWordIds('top100');
      initializeCards(wordIds);
    }
  }, [isLoaded, cards.length, initializeCards]);

  const dueCards = useMemo(() => getCardsForReview(), [getCardsForReview]);

  // Pick (or restore) today's task once the cards exist
  useEffect(() => {
    if (cards.length > 0 && !dailyTask) {
      setDailyTask(getOrCreateDailyTask(cards));
    }
  }, [cards, dailyTask]);

  const startSession = (sessionCards: Card[], daily: boolean, sessionLevel: Level = level) => {
    recordedInSession.current = new Set();
    setSession({ cards: sessionCards, daily, level: sessionLevel });
    setCurrentMode('study');
  };

  const handleStartStudy = () => {
    const categoryWordIds = new Set(getWordsByCategory(selectedCategory).map((w) => w.id));
    const cardsToStudy = dueCards.filter((card) => categoryWordIds.has(card.wordId));

    if (cardsToStudy.length === 0) {
      alert('Keine fälligen Karten in dieser Kategorie');
      return;
    }

    startSession(cardsToStudy, false);
  };

  const handleStartDaily = () => {
    if (!dailyTask) return;
    const taskCards = dailyTask.wordIds
      .map((id) => cards.find((card) => card.wordId === id))
      .filter((card): card is Card => !!card);
    startSession(taskCards, true, nextDailyLevel(dailyTask, level));
  };

  const handleCardComplete = (wordId: string, outcome: Outcome, userAnswer: string) => {
    // Only flipped, nothing typed: doesn't count for stats or spaced repetition
    if (outcome === 'skipped') return;

    // Daily task: only the first answer per word on the first run feeds spaced repetition;
    // retries and repeat runs are practice
    if (session?.daily) {
      // Spaced repetition only learns from the day's first completed run
      if (dailyTask?.completedLevels.length || recordedInSession.current.has(wordId)) return;
      recordedInSession.current.add(wordId);
    }
    const correct = outcome === 'correct';
    // SM-2 quality: 4 = recalled, 1 = failed
    recordProgress(wordId, correct ? 4 : 1, userAnswer, correct);
  };

  const handleDailyComplete = () => {
    if (session?.daily && dailyTask) {
      setDailyTask(markDailyTaskCompleted(dailyTask, session.level));
    }
  };

  const stats = getStats();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shell-100 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-forest-100 border-t-forest-600 rounded-full mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-gray-400">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shell-100 dark:bg-slate-950 text-stone-900 dark:text-gray-100">
      {currentMode !== 'study' && (
        <Navigation currentMode={currentMode} onModeChange={setCurrentMode} />
      )}

      <main className="max-w-xl mx-auto px-5 py-8">
        {currentMode === 'home' && (
          <div className="space-y-6">
            {dailyTask && (
              <button
                onClick={handleStartDaily}
                className={`w-full px-6 py-5 rounded-2xl text-left transition active:scale-[0.98] ${
                  isDailyTaskDone(dailyTask)
                    ? 'bg-forest-50 dark:bg-forest-950/40 ring-1 ring-forest-100 dark:ring-forest-900'
                    : 'bg-gradient-to-br from-forest-500 to-forest-700 text-white shadow-lg shadow-forest-600/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tagesaufgabe</span>
                  <span
                    className={`text-sm font-medium ${
                      isDailyTaskDone(dailyTask) ? 'text-forest-700 dark:text-forest-300' : 'text-white/80'
                    }`}
                  >
                    {isDailyTaskDone(dailyTask) ? '✓ geschafft' : `${dailyTask.wordIds.length} Wörter`}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  {LEVEL_LABELS.map(({ id, label }) => {
                    const done = dailyTask.completedLevels.includes(id);
                    const next = !isDailyTaskDone(dailyTask) && nextDailyLevel(dailyTask, level) === id;
                    return (
                      <span
                        key={id}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isDailyTaskDone(dailyTask)
                            ? 'bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300'
                            : next
                              ? 'bg-white text-forest-700'
                              : 'bg-white/20 text-white'
                        }`}
                      >
                        {done ? '✓ ' : ''}
                        {label}
                      </span>
                    );
                  })}
                </div>
              </button>
            )}

            <div className="text-center py-6">
              <p className="text-6xl font-bold tracking-tight tabular-nums">{dueCards.length}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-forest-600 dark:text-forest-400">fällig</p>
            </div>

            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <DirectionToggle direction={direction} onDirectionChange={handleDirectionChange} />

            <button
              onClick={handleStartStudy}
              className="w-full py-4 rounded-2xl text-lg bg-forest-600 hover:bg-forest-700 active:scale-[0.98] text-white font-medium shadow-lg shadow-forest-600/25 transition"
            >
              Start
            </button>
          </div>
        )}

        {currentMode === 'study' && session && (
          <StudyMode
            cards={session.cards}
            direction={direction}
            level={session.level}
            repeatUntilCorrect={session.daily}
            onCardComplete={handleCardComplete}
            onComplete={handleDailyComplete}
            onFinish={() => setCurrentMode('home')}
          />
        )}

        {currentMode === 'stats' && (
          <StatsComponent stats={stats} />
        )}

        {currentMode === 'settings' && (
          <Settings
            level={level}
            onLevelChange={handleLevelChange}
            theme={theme}
            onThemeChange={handleThemeChange}
            onReset={resetAllProgress}
          />
        )}
      </main>
    </div>
  );
}

export default App;
