import React, { createContext, useContext, useState, useEffect } from 'react';


const ThemeContext = createContext();


export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sb_theme') || 'dark';
  });


  useEffect(() => {
    localStorage.setItem('sb_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      document.body.style.backgroundColor = 'var(--color-bg-base)';
      document.body.style.color = 'var(--color-text-main)';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = 'var(--color-bg-base)';
      document.body.style.color = 'var(--color-text-main)';
    }
  }, [theme]);


  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };


  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
