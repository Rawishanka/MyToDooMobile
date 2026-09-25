import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, Theme as NavTheme } from '@react-navigation/native';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  primary: string;
  accent: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarInactive: string;
  iconContainer: string;
  iconColor: string;
  statusBarStyle: 'light' | 'dark';
}

export const lightColors: ThemeColors = {
  background: '#F4F6FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E8ECF4',
  text: '#1A1D2E',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E8ECF4',
  divider: '#F1F5F9',
  primary: '#003399',
  accent: '#ff6b35',
  tabBar: '#FFFFFF',
  tabBarBorder: 'transparent',
  tabBarInactive: '#718096',
  iconContainer: '#E8F4FD',
  iconColor: '#003399',
  statusBarStyle: 'dark',
};

export const darkColors: ThemeColors = {
  background: '#0B1120',
  surface: '#1E293B',
  card: '#1E293B',
  cardBorder: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  divider: '#1E293B',
  primary: '#38BDF8',
  accent: '#ff6b35',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  tabBarInactive: '#94A3B8',
  iconContainer: 'rgba(56, 189, 248, 0.15)',
  iconColor: '#38BDF8',
  statusBarStyle: 'light',
};

export interface ThemeContextValue {
  isDarkMode: boolean;
  theme: 'light' | 'dark';
  toggleDarkMode: (value?: boolean) => void;
  colors: ThemeColors;
  navigationTheme: NavTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: false,
  theme: 'light',
  toggleDarkMode: () => {},
  colors: lightColors,
  navigationTheme: NavDefaultTheme,
});

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark') {
          setIsDarkMode(true);
        } else if (saved === 'light') {
          setIsDarkMode(false);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = useCallback(async (value?: boolean) => {
    setIsDarkMode((prev) => {
      const next = typeof value === 'boolean' ? value : !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      console.log('🌓 Theme switched to:', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDarkMode ? darkColors : lightColors), [isDarkMode]);

  const navigationTheme = useMemo(() => {
    if (isDarkMode) {
      return {
        ...NavDarkTheme,
        colors: {
          ...NavDarkTheme.colors,
          background: darkColors.background,
          card: darkColors.surface,
          text: darkColors.text,
          border: darkColors.border,
          primary: darkColors.primary,
        },
      };
    }
    return {
      ...NavDefaultTheme,
      colors: {
        ...NavDefaultTheme.colors,
        background: lightColors.background,
        card: lightColors.surface,
        text: lightColors.text,
        border: lightColors.border,
        primary: lightColors.primary,
      },
    };
  }, [isDarkMode]);

  const contextValue = useMemo(
    () => ({
      isDarkMode,
      theme: isDarkMode ? ('dark' as const) : ('light' as const),
      toggleDarkMode,
      colors,
      navigationTheme,
    }),
    [isDarkMode, toggleDarkMode, colors, navigationTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};

export const useThemeColors = (): ThemeColors => {
  const { colors } = useContext(ThemeContext);
  return colors;
};

export default ThemeContext;
