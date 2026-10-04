import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { CategorySelector } from './components/CategorySelector';
import { StudyMode } from './components/StudyMode';
import { StatsComponent } from './components/Stats';
import { useProgress } from './lib/useProgress';
import { getWordIds, getWordsByCategory } from './data/words';
import type { Card } from './types';

function App() {
  const [currentMode, setCurrentMode] = useState<'home' | 'study' | 'quiz' | 'stats'>('home');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'top100' | 'top500' | 'top1000'>('top100');
  const [cardsForStudy, setCardsForStudy] = useState<Card[]>([]);

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

  const handleCardComplete = (wordId: string, quality: number, userAnswer: string) => {
    const correct =
      getWordsByCategory('all').find((w) => w.id === wordId)?.portuguese
        .toLowerCase()
        .trim() === userAnswer.toLowerCase().trim();

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
      <Navigation
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        stats={{
          cardsToday: cardsForStudy.length,
          masteredCards: stats.masteredCards,
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Home screen */}
        {currentMode === 'home' && (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Willkommen zum Portugiesisch-Lerner!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Lerne Portugiesisch mit unserem Spaced-Repetition-System. Wähle eine Wortkategorie und starten Sie mit dem Lernen!
              </p>
            </div>

            <div className="space-y-8">
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Heute</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {cardsForStudy.length}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gemeistert</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {stats.masteredCards}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lernend</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {stats.learningCards}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Genauigkeit</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {stats.accuracy}%
                  </p>
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                  Wähle eine Kategorie
                </h3>
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 max-w-2xl mx-auto">
                <button
                  onClick={handleStartStudy}
                  className="flex-1 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Lernen starten 📚
                </button>
                <button
                  onClick={() => setCurrentMode('stats')}
                  className="flex-1 px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Statistiken ansehen 📊
                </button>
              </div>

              {/* Info cards */}
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    🎯 Spaced Repetition
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Unser System verwendet den SM-2-Algorithmus, um optimale Lernintervalle zu berechnen.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    💾 Offline-First
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Alle Daten werden lokal gespeichert. Lerne überall ohne Internetverbindung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study mode */}
        {currentMode === 'study' && (
          <StudyMode
            cards={cardsForStudy}
            onCardComplete={handleCardComplete}
            onFinish={() => setCurrentMode('home')}
          />
        )}

        {/* Quiz mode (placeholder) */}
        {currentMode === 'quiz' && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Quiz-Modus kommt bald! 🚀
            </p>
            <button
              onClick={() => setCurrentMode('home')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Zurück
            </button>
          </div>
        )}

        {/* Stats mode */}
        {currentMode === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Deine Statistiken
            </h2>
            <StatsComponent stats={stats} onReset={resetAllProgress} />
            <button
              onClick={() => setCurrentMode('home')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Zurück
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Português Lernen v0.1.0 | PWA mit Spaced Repetition & LocalStorage
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
