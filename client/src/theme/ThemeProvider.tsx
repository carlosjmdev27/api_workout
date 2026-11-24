import { useEffect, useMemo, useState, type JSX, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextValue } from './theme-context';
import { applyTheme, readStoredTheme, storeTheme, type Theme } from './theme-storage';
// Note: public/theme-init.js already applied the saved theme before React loaded (no flash).

/** Light/dark theme: saved in localStorage ("auraworkout-theme"), dark the first time. */
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    storeTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
