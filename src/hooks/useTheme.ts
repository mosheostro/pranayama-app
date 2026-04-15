import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'aurora' | 'dark';

const STORAGE_KEY = 'sacred-breath-theme';

export function useThemeState() {
  const [theme, setThemeRaw] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'aurora' || stored === 'dark') ? stored : 'aurora';
  });

  const setTheme = (t: Theme) => {
    setThemeRaw(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

export const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'aurora',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
