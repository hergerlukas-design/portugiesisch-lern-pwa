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
    <div className="space-y-10">
      <h2 className="text-2xl font-bold tracking-tight">Einstellungen</h2>

      <div>
        <p className="text-sm text-stone-500 dark:text-gray-400 mb-3">Niveau</p>
        <Segmented options={LEVELS} value={level} onChange={onLevelChange} />
        <p className="mt-2 text-xs text-stone-500 dark:text-gray-400">
          {level === 'beginner' ? '4 Antworten zur Auswahl' : 'Antwort selbst eintippen'}
        </p>
      </div>

      <div>
        <p className="text-sm text-stone-500 dark:text-gray-400 mb-3">Darstellung</p>
        <Segmented options={THEMES} value={theme} onChange={onThemeChange} />
      </div>

      <button
        onClick={handleUpdate}
        disabled={updating}
        className="w-full py-3 rounded-xl border border-forest-600 dark:border-forest-400 text-forest-700 dark:text-forest-300 font-medium hover:bg-forest-50 dark:hover:bg-forest-950/40 disabled:opacity-60 transition"
      >
        {updating ? 'Wird aktualisiert…' : '↻ App aktualisieren'}
      </button>

      <div className="space-y-4">
        <button
          onClick={handleResetDaily}
          className="block text-sm text-stone-500 dark:text-gray-400 hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
        >
          {dailyReset ? '✓ Tagesaufgabe zurückgesetzt' : 'Tagesaufgabe zurücksetzen'}
        </button>
        <button
          onClick={handleReset}
          className="block text-sm text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          Fortschritt zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default Settings;
