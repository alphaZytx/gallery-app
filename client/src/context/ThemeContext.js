import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../styles/theme'; // Ensure theme.js is in ../styles/

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('themeMode');
      return storedTheme ? storedTheme : 'dark'; // Default to dark mode
    } catch (error) {
      console.warn("Could not access localStorage for theme. Defaulting to dark mode.", error);
      return 'dark';
    }
  });

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    try {
      localStorage.setItem('themeMode', newThemeMode);
    } catch (error) {
      console.warn("Could not save theme to localStorage.", error);
    }
  };

  useEffect(() => {
    document.body.style.fontFamily = theme.fontFamily;
  }, [theme.fontFamily]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};