export type Theme = 'dark' | 'light';

/** Also read by public/theme-init.js (before React loads): keep both in sync. */
export const THEME_STORAGE_KEY = 'auraworkout-theme';
export const DEFAULT_THEME: Theme = 'dark';

export function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME; // Storage blocked: default theme.
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not persisted; the theme still applies for this visit.
  }
}

/** Tailwind `dark:` variant and the CSS tokens in index.css both key off this class. */
export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
