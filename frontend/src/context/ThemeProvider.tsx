import React, { useEffect, useState } from 'react';
import { Theme, ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedValue = localStorage.getItem('theme') as Theme;
    if (storedValue) return storedValue;
    // Forzamos 'light' como predeterminado según solicitud del usuario
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    
    // Remover ambas clases primero
    root.classList.remove('light', 'dark');
    // Agregar la actual
    root.classList.add(theme);
    
    // Opcional: Actualizar el color-scheme del navegador
    root.style.colorScheme = theme;
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
