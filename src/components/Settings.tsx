import React, { useState } from 'react';
import type { Level } from '../types';
import { Segmented } from './Segmented';

interface SettingsProps {
  level: Level;
  onLevelChange: (level: Level) => void;
  onReset: () => void;
}

const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Anfänger' },
  { id: 'advanced', label: 'Fortgeschritten' },
];

export const Settings: React.FC<SettingsProps> = ({ level, onLevelChange, onReset }) => {
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

      <button
        onClick={handleUpdate}
        disabled={updating}
        className="w-full py-3 rounded-xl border border-forest-600 dark:border-forest-400 text-forest-700 dark:text-forest-300 font-medium hover:bg-forest-50 dark:hover:bg-forest-950/40 disabled:opacity-60 transition"
      >
        {updating ? 'Wird aktualisiert…' : '↻ App aktualisieren'}
      </button>

      <button
        onClick={handleReset}
        className="text-sm text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      >
        Fortschritt zurücksetzen
      </button>
    </div>
  );
};

export default Settings;
