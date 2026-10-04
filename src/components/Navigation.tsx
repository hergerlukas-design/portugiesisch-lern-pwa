import React from 'react';

interface NavigationProps {
  currentMode: 'home' | 'study' | 'quiz' | 'stats';
  onModeChange: (mode: 'home' | 'study' | 'quiz' | 'stats') => void;
  stats?: {
    cardsToday: number;
    masteredCards: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentMode,
  onModeChange,
  stats,
}) => {
  const isActive = (mode: string) =>
    currentMode === mode
      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200';

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Logo and title */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Português Lernen
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mit Spaced Repetition & Flashcards
              </p>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => onModeChange('home')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 border-transparent ${isActive('home')}`}
          >
            Startseite
          </button>
          <button
            onClick={() => onModeChange('study')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 border-transparent ${isActive('study')}`}
          >
            Lernen
            {stats && stats.cardsToday > 0 && (
              <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full">
                {stats.cardsToday}
              </span>
            )}
          </button>
          <button
            onClick={() => onModeChange('quiz')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 border-transparent ${isActive('quiz')}`}
          >
            Quiz
          </button>
          <button
            onClick={() => onModeChange('stats')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 border-transparent ${isActive('stats')}`}
          >
            Statistiken
          </button>
        </div>

        {/* Quick stats bar */}
        {stats && (
          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Heute zu üben:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {stats.cardsToday} Karten
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Gemeistert:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {stats.masteredCards}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
