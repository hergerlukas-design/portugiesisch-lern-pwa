import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation, ScreenHeader } from './components/Navigation';
import { Backdrop } from './components/Backdrop';
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
  resetTodaysDailyTasks,
  type DailyTask,
} from './lib/dailyTask';
import { getWordIds, getWordsByCategory } from './data/words';
import type { Card, Direction, Level, Outcome, Theme } from './types';

const DIRECTION_KEY = 'studyDirection';

type Category = 'all' | 'top100' | 'top500' | 'top1000';

const todayLabel = () =>
  new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Bom dia!' : hour < 18 ? 'Boa tarde!' : 'Boa noite!';
};

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
  const [selectedCategory, setSelectedCategory] = useState<Category>('top100');
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
  } = useProgress(direction);

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
    // One task per direction; switching direction loads (or creates) that one
    if (dailyTask?.direction !== direction) {
      setDailyTask(cards.length > 0 ? getOrCreateDailyTask(cards, direction) : null);
    }
  }, [cards, dailyTask, direction]);

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
      if (dailyTask?.scheduled || recordedInSession.current.has(wordId)) return;
      recordedInSession.current.add(wordId);
    }
    const correct = outcome === 'correct';
    // SM-2 quality: 4 = recalled, 1 = failed
    recordProgress(wordId, correct ? 4 : 1, userAnswer, correct);
  };

  const handleResetDaily = () => {
    resetTodaysDailyTasks();
    // Reloaded from storage by the daily task effect
    setDailyTask(null);
  };

  const handleDailyComplete = () => {
    if (session?.daily && dailyTask) {
      setDailyTask(markDailyTaskCompleted(dailyTask, session.level));
    }
  };

  const stats = getStats();

  // Words per category and how many of them have been studied (in this direction)
  const categoryCounts = useMemo(() => {
    const studied = new Set(cards.filter((c) => c.status !== 'new').map((c) => c.wordId));
    const count = (category: Category) => {
      const words = getWordsByCategory(category);
      return { words: words.length, learned: words.filter((w) => studied.has(w.id)).length };
    };
    return { top100: count('top100'), top500: count('top500'), top1000: count('top1000'), all: count('all') };
  }, [cards]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Backdrop />
        <div className="glass rounded-3xl px-8 py-7 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-forest-100 border-t-forest-600 rounded-full mx-auto mb-3"></div>
          <p className="font-semibold text-muted dark:text-gray-300">Lädt...</p>
        </div>
      </div>
    );
  }

  const dailyDone = dailyTask ? isDailyTaskDone(dailyTask) : false;
  const dailyProgress = dailyTask ? dailyTask.completedLevels.length / LEVEL_LABELS.length : 0;
  const RING = 2 * Math.PI * 31;

  return (
    <div className="min-h-screen text-ink dark:text-gray-100">
      <Backdrop />

      <main className={`w-full max-w-md mx-auto px-5 ${currentMode === 'study' ? 'pb-10' : 'pb-36'}`}>
        {currentMode === 'home' && (
          <div className="space-y-[18px]">
            <ScreenHeader eyebrow={todayLabel()} title={greeting()} onSettings={() => setCurrentMode('settings')} />

            {dailyTask && (
              <section className="glass-hero rounded-[33px] p-[22px] flex flex-col gap-[18px] text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold tracking-[0.08em] uppercase text-white/90">Tagesaufgabe</span>
                    <span className="font-display font-bold text-[26px] leading-[1.1]">
                      {dailyDone ? 'Geschafft!' : `${dailyTask.wordIds.length} Wörter`}
                    </span>
                    <div className="flex gap-1.5 mt-1">
                      {LEVEL_LABELS.map(({ id, label }) => {
                        const done = dailyTask.completedLevels.includes(id);
                        const next = !dailyDone && nextDailyLevel(dailyTask, level) === id;
                        return (
                          <span
                            key={id}
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              next ? 'bg-white text-forest-800' : done ? 'bg-white/25 text-white' : 'bg-white/15 text-white'
                            }`}
                          >
                            {done ? '✓ ' : ''}
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="relative w-[76px] h-[76px] shrink-0">
                    <svg viewBox="0 0 76 76" className="w-full h-full" aria-hidden>
                      <circle cx="38" cy="38" r="31" fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="8" />
                      {dailyProgress > 0 && (
                        <circle
                          cx="38"
                          cy="38"
                          r="31"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${dailyProgress * RING} ${RING}`}
                          transform="rotate(-90 38 38)"
                        />
                      )}
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-bold">
                      {dailyTask.completedLevels.length}/{LEVEL_LABELS.length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleStartDaily}
                  className="h-[52px] rounded-2xl bg-white/90 shadow-[inset_0_1px_0_#fff] text-ink font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
                >
                  {dailyDone ? 'Nochmal üben' : dailyTask.completedLevels.length > 0 ? 'Weiterlernen' : 'Starten'}
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </section>
            )}

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Fällig', value: dueCards.length },
                { label: 'Heute', value: stats.todayReviews },
                { label: 'Genauigkeit', value: `${stats.accuracy}%` },
              ].map(({ label, value }) => (
                <div key={label} className="glass rounded-[18px] px-3.5 py-3 flex flex-col gap-0.5">
                  <span className="font-display font-bold text-[22px] tabular-nums">{value}</span>
                  <span className="text-xs font-semibold text-muted dark:text-gray-300">{label}</span>
                </div>
              ))}
            </div>

            <section className="flex flex-col gap-2.5">
              <h2 className="m-0 text-[13px] font-bold tracking-[0.06em] uppercase text-muted dark:text-gray-300">Richtung</h2>
              <DirectionToggle direction={direction} onDirectionChange={handleDirectionChange} />
            </section>

            <section className="flex flex-col gap-2.5">
              <h2 className="m-0 text-[13px] font-bold tracking-[0.06em] uppercase text-muted dark:text-gray-300">Wortschatz</h2>
              <CategorySelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                counts={categoryCounts}
              />
            </section>

            <button
              onClick={handleStartStudy}
              className="w-full h-14 rounded-2xl bg-ink dark:bg-white text-white dark:text-ink font-bold text-base shadow-[0_12px_28px_-14px_rgb(20_32_27/0.7)] active:scale-[0.98] transition"
            >
              Fällige Karten lernen
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
          <div className="space-y-[18px]">
            <ScreenHeader eyebrow="Dein Fortschritt" title="Statistik" onSettings={() => setCurrentMode('settings')} />
            <DirectionToggle direction={direction} onDirectionChange={handleDirectionChange} />
            <StatsComponent stats={stats} direction={direction} />
          </div>
        )}

        {currentMode === 'settings' && (
          <div className="space-y-[18px]">
            <ScreenHeader eyebrow="App" title="Einstellungen" settingsActive onSettings={() => setCurrentMode('home')} />
            <Settings
              level={level}
              onLevelChange={handleLevelChange}
              theme={theme}
              onThemeChange={handleThemeChange}
              onReset={resetAllProgress}
              onResetDaily={handleResetDaily}
            />
          </div>
        )}
      </main>

      {currentMode !== 'study' && <Navigation currentMode={currentMode} onModeChange={setCurrentMode} />}
    </div>
  );
}

export default App;
