import React from 'react';
import type { Stats } from '../types';

interface StatsProps {
  stats: Stats;
  onReset?: () => void;
}

export const StatsComponent: React.FC<StatsProps> = ({ stats, onReset }) => {
  const getCardStatusColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-slate-800';
    if (count < 5) return 'bg-red-100 dark:bg-red-900/30';
    if (count < 20) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  const getCardStatusTextColor = (count: number): string => {
    if (count === 0) return 'text-gray-600 dark:text-gray-400';
    if (count < 5) return 'text-red-700 dark:text-red-300';
    if (count < 20) return 'text-yellow-700 dark:text-yellow-300';
    return 'text-green-700 dark:text-green-300';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Main metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-6 rounded-lg ${getCardStatusColor(stats.totalCards)}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gesamt</p>
          <p className={`text-3xl font-bold mt-2 ${getCardStatusTextColor(stats.totalCards)}`}>
            {stats.totalCards}
          </p>
        </div>
        <div className={`p-6 rounded-lg ${getCardStatusColor(stats.todayReviews)}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400">Heute</p>
          <p className={`text-3xl font-bold mt-2 ${getCardStatusTextColor(stats.todayReviews)}`}>
            {stats.todayReviews}
          </p>
        </div>
        <div className={`p-6 rounded-lg ${getCardStatusColor(stats.weekReviews)}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400">Diese Woche</p>
          <p className={`text-3xl font-bold mt-2 ${getCardStatusTextColor(stats.weekReviews)}`}>
            {stats.weekReviews}
          </p>
        </div>
        <div className="p-6 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">Genauigkeit</p>
          <p className="text-3xl font-bold mt-2 text-blue-700 dark:text-blue-300">
            {stats.accuracy}%
          </p>
        </div>
      </div>

      {/* Card status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-slate-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
            Neu
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.newCards}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
            Lernend
          </p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
            {stats.learningCards}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
            Wiederh.
          </p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
            {stats.reviewingCards}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
            Gemeistert
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
            {stats.masteredCards}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
            Streak
          </p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
            {stats.streak}
          </p>
        </div>
      </div>

      {/* Accuracy breakdown */}
      <div className="p-6 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Antwortgenauigkeit
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Richtig
              </p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {stats.correctAnswers} / {stats.totalAnswers}
              </p>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${
                    stats.totalAnswers > 0
                      ? (stats.correctAnswers / stats.totalAnswers) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Falsch
              </p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {stats.totalAnswers - stats.correctAnswers} / {stats.totalAnswers}
              </p>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{
                  width: `${
                    stats.totalAnswers > 0
                      ? ((stats.totalAnswers - stats.correctAnswers) /
                          stats.totalAnswers) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress description */}
      <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Dein Fortschritt
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            • Du hast <strong>{stats.totalAnswers}</strong> Fragen beantwortet
          </li>
          <li>
            • Deine beste Serie: <strong>{stats.streak}</strong> richtige Antworten
          </li>
          <li>
            • Du beherrschst <strong>{stats.masteredCards}</strong> Wörter
          </li>
          <li>
            • <strong>{stats.newCards}</strong> neue Wörter warten auf dich
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      {onReset && (
        <div className="flex gap-4">
          <button
            onClick={onReset}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Fortschritt zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
};

export default StatsComponent;
