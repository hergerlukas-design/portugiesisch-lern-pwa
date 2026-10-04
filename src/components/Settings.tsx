import React, { useState } from 'react';
import type { Level, Theme } from '../types';
import { Segmented } from './Segmented';

interface SettingsProps {
  level: Level;
  onLevelChange: (level: Level) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onReset: () => void;
  onResetDaily: () => void;
}

const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Anfänger' },
  { id: 'advanced', label: 'Fortgeschritten' },
];

const THEMES: { id: Theme; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
];

export const Settings: React.FC<SettingsProps> = ({
  level,
  onLevelChange,
  theme,
  onThemeChange,
  onReset,
  onResetDaily,
}) => {
  const [dailyReset, setDailyReset] = useState(false);

  const [updating, setUpdating] = useState(false);

  // Fetch the latest service worker and reload; pages load network-first, so the
  // reload shows the newest deployed version
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      await registration?.update();
    } catch {
      // Offline or no service worker: the reload below still picks up what it can
    }
    window.location.reload();
  };

  const handleResetDaily = () => {
    if (confirm('Tagesaufgabe von heute zurücksetzen? Du kannst sie dann nochmal machen.')) {
      onResetDaily();
      setDailyReset(true);
    }
  };

  const handleReset = () => {
    if (confirm('Gesamten Lernfortschritt löschen? Das kann nicht rückgängig gemacht werden.')) {
      onReset();
    }
  };

  return (
    <div className="space-y-3.5">
      <section className="glass rounded-3xl p-[18px] space-y-3">
        <h2 className="m-0 text-[13px] font-bold tracking-[0.06em] uppercase text-muted dark:text-gray-300">Niveau</h2>
        <Segmented options={LEVELS} value={level} onChange={onLevelChange} label="Niveau" />
        <p className="text-xs font-medium text-muted dark:text-gray-300">
          {level === 'beginner' ? '4 Antworten zur Auswahl' : 'Antwort selbst eintippen'}
        </p>
      </section>

      <section className="glass rounded-3xl p-[18px] space-y-3">
        <h2 className="m-0 text-[13px] font-bold tracking-[0.06em] uppercase text-muted dark:text-gray-300">Darstellung</h2>
        <Segmented options={THEMES} value={theme} onChange={onThemeChange} label="Darstellung" />
      </section>

      <button
        onClick={handleUpdate}
        disabled={updating}
        className="glass w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-forest-800 dark:text-forest-200 disabled:opacity-60 transition active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        {updating ? 'Wird aktualisiert…' : 'App aktualisieren'}
      </button>

      <section className="glass rounded-3xl p-2 flex flex-col">
        <button
          onClick={handleResetDaily}
          className="h-12 px-3 rounded-2xl text-left text-sm font-semibold text-ink dark:text-white hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        >
          {dailyReset ? 'Tagesaufgabe zurückgesetzt' : 'Tagesaufgabe zurücksetzen'}
        </button>
        <button
          onClick={handleReset}
          className="h-12 px-3 rounded-2xl text-left text-sm font-semibold text-red-800 dark:text-red-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        >
          Fortschritt zurücksetzen
        </button>
      </section>
    </div>
  );
};

export default Settings;
