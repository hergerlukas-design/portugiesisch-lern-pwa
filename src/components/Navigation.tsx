import React from 'react';

type Mode = 'home' | 'stats' | 'settings';

interface NavigationProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const TABS: { mode: 'home' | 'stats'; label: string; icon: React.ReactNode }[] = [
  {
    mode: 'home',
    label: 'Lernen',
    icon: (
      <>
        <rect x="3" y="5" width="14" height="16" rx="3" />
        <path d="M7 3h11a3 3 0 0 1 3 3v11" />
      </>
    ),
  },
  {
    mode: 'stats',
    label: 'Statistik',
    icon: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
      </>
    ),
  },
];

// Floating glass tab bar at the bottom of the screen
export const Navigation: React.FC<NavigationProps> = ({ currentMode, onModeChange }) => (
  <nav
    aria-label="Hauptnavigation"
    className="fixed inset-x-0 bottom-0 z-20 px-3.5 pb-[max(1.375rem,env(safe-area-inset-bottom))]"
  >
    <div className="glass max-w-md mx-auto grid grid-cols-2 gap-2 p-1.5 rounded-[22px]">
      {TABS.map(({ mode, label, icon }) => {
        const active = currentMode === mode;
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            aria-current={active ? 'page' : undefined}
            className={`h-12 rounded-2xl flex items-center justify-center gap-2 text-sm transition ${
              active
                ? 'glass-active font-bold text-forest-800 dark:text-forest-200'
                : 'font-semibold text-muted dark:text-gray-300 hover:text-ink dark:hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {icon}
            </svg>
            {label}
          </button>
        );
      })}
    </div>
  </nav>
);

interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  onSettings?: () => void;
  settingsActive?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ eyebrow, title, onSettings, settingsActive }) => (
  <header className="flex items-center justify-between pt-7 pb-2">
    <div className="flex flex-col gap-0.5">
      <span className="text-[13px] font-semibold text-muted dark:text-gray-300 tracking-wide">{eyebrow}</span>
      <h1 className="m-0 font-display font-extrabold text-[34px] tracking-tight leading-[1.05]">{title}</h1>
    </div>
    {onSettings && (
      <button
        onClick={onSettings}
        aria-label="Einstellungen"
        aria-pressed={settingsActive}
        className={`${settingsActive ? 'glass-active' : 'glass'} w-11 h-11 rounded-full flex items-center justify-center text-ink dark:text-white`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    )}
  </header>
);

export default Navigation;
