import React from 'react';
import type { Direction } from '../types';

interface DirectionToggleProps {
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
}

const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: 'de-pt', label: 'DE → PT' },
  { id: 'pt-de', label: 'PT → DE' },
];

export const DirectionToggle: React.FC<DirectionToggleProps> = ({ direction, onDirectionChange }) => {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-gray-100 dark:bg-slate-800">
      {DIRECTIONS.map((d) => (
        <button
          key={d.id}
          onClick={() => onDirectionChange(d.id)}
          className={`py-2 rounded-md text-sm transition-colors ${
            direction === d.id
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-medium shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
};

export default DirectionToggle;
