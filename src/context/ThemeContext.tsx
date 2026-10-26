import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB } from '../services/database';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  subtext: string;
  primary: string;
  primaryLight: string;
  inputBg: string;
  chipBg: string;
}

export const lightColors: ThemeColors = {
  isDark: false,
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  subtext: '#64748b',
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  inputBg: '#f8fafc',
  chipBg: '#f1f5f9',
};

export const darkColors: ThemeColors = {
  isDark: true,
  background: '#0f172a',
  surface: '#1e293b',
  card: '#1e293b',
  border: '#334155',
  text: '#f8fafc',
  subtext: '#94a3b8',
  primary: '#3b82f6',
  primaryLight: '#1e3a8a',
  inputBg: '#0f172a',
  chipBg: '#334155',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    try {
      const db = getDB();
      const row = db.getFirstSync<{ value: string }>(
        "SELECT value FROM user_settings WHERE key = 'theme_mode'"
      );
      if (row && (row.value === 'light' || row.value === 'dark')) {
        setMode(row.value as ThemeMode);
      }
    } catch {
      // Default to light
    }
  }, []);

  const saveMode = (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      const db = getDB();
      db.runSync(
        "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('theme_mode', ?)",
        [newMode]
      );
    } catch {}
  };

  const toggleTheme = () => {
    saveMode(mode === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (newMode: ThemeMode) => {
    saveMode(newMode);
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
