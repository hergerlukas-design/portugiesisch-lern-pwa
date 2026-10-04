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
    <header className="sticky top-0 z-10 bg-shell-100/80 dark:bg-slate-950/80 backdrop-blur border-b border-shell-200 dark:border-slate-900">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-center">
        <nav className="flex gap-1">
          {TABS.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                currentMode === mode
                  ? 'bg-forest-50 dark:bg-forest-950/50 text-forest-700 dark:text-forest-300 font-semibold'
                  : 'text-stone-500 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
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
