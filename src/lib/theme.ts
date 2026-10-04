import type { Theme } from '../types';

// Same key is read by the inline script in index.html before first paint
const THEME_KEY = 'theme';

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Choice just won't persist
  }
}

/**
 * Toggle the `dark` class on <html>; for "system", keep following the device setting.
 * Returns a cleanup function.
 */
export function applyTheme(theme: Theme): () => void {
  const update = () => {
    const dark = theme === 'dark' || (theme === 'system' && darkQuery().matches);
    document.documentElement.classList.toggle('dark', dark);
  };
  update();
  if (theme !== 'system') return () => {};
  const query = darkQuery();
  query.addEventListener('change', update);
  return () => query.removeEventListener('change', update);
}
