import React from 'react';

type Mode = 'home' | 'stats';

interface NavigationProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const TABS: { mode: Mode; label: string }[] = [
  { mode: 'home', label: 'Lernen' },
  { mode: 'stats', label: 'Statistik' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentMode, onModeChange }) => {
  return (
    <header className="border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900 dark:text-white">Português Lernen</h1>
        <nav className="flex gap-1">
          {TABS.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                currentMode === mode
                  ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
