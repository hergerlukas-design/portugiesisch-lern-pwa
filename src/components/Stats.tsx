import React from 'react';
import type { Stats } from '../types';

interface StatsProps {
  stats: Stats;
  onReset?: () => void;
}

export const StatsComponent: React.FC<StatsProps> = ({ stats, onReset }) => {
  const total = Math.max(stats.totalCards, 1);

  const metrics = [
    { label: 'Heute', value: stats.todayReviews },
    { label: 'Diese Woche', value: stats.weekReviews },
    { label: 'Genauigkeit', value: `${stats.accuracy}%` },
    { label: 'Beste Serie', value: stats.streak },
  ];

  const statuses = [
    { label: 'Neu', value: stats.newCards, color: 'bg-gray-300 dark:bg-slate-600' },
    { label: 'Lernend', value: stats.learningCards, color: 'bg-orange-400' },
    { label: 'Wiederholen', value: stats.reviewingCards, color: 'bg-blue-500' },
    { label: 'Gemeistert', value: stats.masteredCards, color: 'bg-green-500' },
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
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
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
