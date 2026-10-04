import React from 'react';
import type { Stats } from '../types';

interface StatsProps {
  stats: Stats;
  onReset?: () => void;
  // Settings shown below the numbers, above the reset link
  settings?: React.ReactNode;
}

export const StatsComponent: React.FC<StatsProps> = ({ stats, onReset, settings }) => {
  const total = Math.max(stats.totalCards, 1);

  const metrics = [
    { label: 'Heute', value: stats.todayReviews },
    { label: 'Diese Woche', value: stats.weekReviews },
    { label: 'Genauigkeit', value: `${stats.accuracy}%` },
    { label: 'Beste Serie', value: stats.streak },
  ];

  const statuses = [
    { label: 'Neu', value: stats.newCards, color: 'bg-gray-200 dark:bg-slate-700' },
    { label: 'Lernend', value: stats.learningCards, color: 'bg-forest-200 dark:bg-forest-900' },
    { label: 'Wiederholen', value: stats.reviewingCards, color: 'bg-forest-400' },
    { label: 'Gemeistert', value: stats.masteredCards, color: 'bg-forest-600' },
  ];

  const handleReset = () => {
    if (onReset && confirm('Gesamten Lernfortschritt löschen? Das kann nicht rückgängig gemacht werden.')) {
      onReset();
    }
  };

  return (
    <div className="space-y-10">
      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Card status breakdown */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {stats.totalCards} Karten
        </p>
        <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
          {statuses.map(({ label, value, color }) => (
            <div key={label} className={color} style={{ width: `${(value / total) * 100}%` }} />
          ))}
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {statuses.map(({ label, value, color }) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="flex-1 text-gray-600 dark:text-gray-300">{label}</span>
              <span className="tabular-nums font-medium">{value}</span>
            </li>
          ))}
        </ul>
      </div>

      {settings}

      {onReset && (
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          Fortschritt zurücksetzen
        </button>
      )}
    </div>
  );
};

export default StatsComponent;
