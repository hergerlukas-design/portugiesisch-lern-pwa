import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from './components/Navigation';
import { CategorySelector } from './components/CategorySelector';
import { DirectionToggle } from './components/DirectionToggle';
import { Segmented } from './components/Segmented';
import { StudyMode } from './components/StudyMode';
import { StatsComponent } from './components/Stats';
import { useProgress } from './lib/useProgress';
import {
  getOrCreateDailyTask,
  markDailyTaskCompleted,
  type DailyTask,
} from './lib/dailyTask';
import { getWordIds, getWordsByCategory } from './data/words';
import type { Card, Direction, Level, Outcome } from './types';

const DIRECTION_KEY = 'studyDirection';
const LEVEL_KEY = 'studyLevel';

const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Anfänger' },
  { id: 'advanced', label: 'Fortgeschritten' },
];

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
  const [currentMode, setCurrentMode] = useState<'home' | 'study' | 'stats'>('home');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'top100' | 'top500' | 'top1000'>('top100');
  // Cards of the running session, fixed at start so ratings don't reshuffle it
  const [session, setSession] = useState<{ cards: Card[]; daily: boolean } | null>(null);
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

  const startSession = (sessionCards: Card[], daily: boolean) => {
    recordedInSession.current = new Set();
    setSession({ cards: sessionCards, daily });
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
    startSession(taskCards, true);
  };

  const handleCardComplete = (wordId: string, outcome: Outcome, userAnswer: string) => {
    // Only flipped, nothing typed: doesn't count for stats or spaced repetition
    if (outcome === 'skipped') return;

    // Daily task: only the first answer per word on the first run feeds spaced repetition;
    // retries and repeat runs are practice
    if (session?.daily) {
      if (dailyTask?.completed || recordedInSession.current.has(wordId)) return;
      recordedInSession.current.add(wordId);
    }
    const correct = outcome === 'correct';
    // SM-2 quality: 4 = recalled, 1 = failed
    recordProgress(wordId, correct ? 4 : 1, userAnswer, correct);
  };

  const handleDailyComplete = () => {
    if (session?.daily && dailyTask && !dailyTask.completed) {
      setDailyTask(markDailyTaskCompleted(dailyTask));
    }
  };

  const stats = getStats();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      {currentMode !== 'study' && (
        <Navigation currentMode={currentMode} onModeChange={setCurrentMode} />
      )}

      <main className="max-w-xl mx-auto px-4 py-8">
        {currentMode === 'home' && (
          <div className="space-y-6">
            {dailyTask && (
              <button
                onClick={handleStartDaily}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-colors ${
                  dailyTask.completed
                    ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900'
                }`}
              >
                <span className="font-medium">Tagesaufgabe</span>
                <span
                  className={
                    dailyTask.completed
                      ? 'text-green-600 dark:text-green-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                >
                  {dailyTask.completed ? '✓ geschafft' : `${dailyTask.wordIds.length} Wörter`}
                </span>
              </button>
            )}

            <div className="text-center py-6">
              <p className="text-5xl font-semibold tabular-nums">{dueCards.length}</p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">fällig</p>
            </div>

            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <DirectionToggle direction={direction} onDirectionChange={handleDirectionChange} />

            <button
              onClick={handleStartStudy}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition-colors"
            >
              Start
            </button>
          </div>
        )}

        {currentMode === 'study' && session && (
          <StudyMode
            cards={session.cards}
            direction={direction}
            level={level}
            repeatUntilCorrect={session.daily}
            onCardComplete={handleCardComplete}
            onComplete={handleDailyComplete}
            onFinish={() => setCurrentMode('home')}
          />
        )}

        {currentMode === 'stats' && (
          <StatsComponent
            stats={stats}
            onReset={resetAllProgress}
            settings={
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Niveau</p>
                <Segmented options={LEVELS} value={level} onChange={handleLevelChange} />
              </div>
            }
          />
        )}
      </main>
    </div>
  );
}

export default App;
