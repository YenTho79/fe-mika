import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
export { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/theme';
import { THEME_PREFERENCE } from '../services/storageKeys';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  const contextValue = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      theme,
      isDark,
      colors: isDark ? darkColors : lightColors,
      toggleTheme,
      changeTheme,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
