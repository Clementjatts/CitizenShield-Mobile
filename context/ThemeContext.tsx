import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme as ThemeType);
      }
    });

    // Add listener for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if we're using system theme
      if (theme === 'system') {
        // Force a re-render by updating the state
        setThemeState('system');
      }
    });

    // Cleanup subscription
    return () => {
      subscription.remove();
    };
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  const actualTheme = theme === 'system' 
    ? systemColorScheme || 'light'
    : theme;

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
