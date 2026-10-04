import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { CategorySelector } from './components/CategorySelector';
import { DirectionToggle } from './components/DirectionToggle';
import { StudyMode } from './components/StudyMode';
import { StatsComponent } from './components/Stats';
import { useProgress } from './lib/useProgress';
import { getWordIds, getWordsByCategory } from './data/words';
import type { Card, Direction } from './types';

const DIRECTION_KEY = 'studyDirection';

function loadDirection(): Direction {
  try {
    return localStorage.getItem(DIRECTION_KEY) === 'pt-de' ? 'pt-de' : 'de-pt';
  } catch {
    return 'de-pt';
  }
}

function App() {
  const [currentMode, setCurrentMode] = useState<'home' | 'study' | 'stats'>('home');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'top100' | 'top500' | 'top1000'>('top100');
  const [cardsForStudy, setCardsForStudy] = useState<Card[]>([]);
  const [direction, setDirection] = useState<Direction>(loadDirection);

  const handleDirectionChange = (newDirection: Direction) => {
    setDirection(newDirection);
    try {
      localStorage.setItem(DIRECTION_KEY, newDirection);
    } catch {
      // Preference just won't persist
    }
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

  // Get cards due for review
  useEffect(() => {
    const cardsForReview = getCardsForReview();
    setCardsForStudy(cardsForReview);
  }, [cards, getCardsForReview]);

  const handleStartStudy = () => {
    const wordsInCategory = getWordsByCategory(selectedCategory);
    const categoryWordIds = wordsInCategory.map((w) => w.id);

    // Get cards in this category that are due for review
    const cardsToStudy = cards.filter((card) =>
      categoryWordIds.includes(card.wordId)
    );

    if (cardsToStudy.length === 0) {
      alert('Keine Karten zum Lernen in dieser Kategorie verfügbar');
      return;
    }

    setCardsForStudy(cardsToStudy);
    setCurrentMode('study');
  };

  const handleCardComplete = (
    wordId: string,
    quality: number,
    userAnswer: string,
    correct: boolean
  ) => {
    recordProgress(wordId, quality, userAnswer, correct);
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
            <div className="text-center py-6">
              <p className="text-5xl font-semibold tabular-nums">{cardsForStudy.length}</p>
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

        {currentMode === 'study' && (
          <StudyMode
            cards={cardsForStudy}
            direction={direction}
            onCardComplete={handleCardComplete}
            onFinish={() => setCurrentMode('home')}
          />
        )}

        {currentMode === 'stats' && (
          <StatsComponent stats={stats} onReset={resetAllProgress} />
        )}
      </main>
    </div>
  );
}

export default App;
