import React from 'react';

type Mode = 'home' | 'stats' | 'settings';

interface NavigationProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const TABS: { mode: 'home' | 'stats'; label: string }[] = [
  { mode: 'home', label: 'Lernen' },
  { mode: 'stats', label: 'Statistik' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentMode, onModeChange }) => {
  return (
    <header className="sticky top-0 z-10 bg-shell-100/80 dark:bg-slate-950/80 backdrop-blur border-b border-shell-200 dark:border-slate-900">
      <div className="max-w-xl mx-auto px-4 h-14 grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
        <nav className="col-start-2 flex justify-center gap-1">
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
        <button
          onClick={() => onModeChange('settings')}
          aria-label="Einstellungen"
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            currentMode === 'settings'
              ? 'bg-forest-50 dark:bg-forest-950/50 text-forest-700 dark:text-forest-300'
              : 'text-stone-500 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navigation;
