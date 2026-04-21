import React, { useEffect, useState } from 'react';
import { Theme, ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedValue = localStorage.getItem('theme') as Theme;
    if (storedValue) return storedValue;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {theme === 'dark' ? (
          <div className="dark contents">{children}</div>
      ) : (
          <div className="light contents">{children}</div>
      )}
    </ThemeContext.Provider>
  );
}
