'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type Theme, getThemeById, themes } from '../types/theme';

interface ThemeContextType {
  theme: Theme;
  setThemeById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultThemeId?: string;
}

// Function to get system color scheme preference
const getSystemThemePreference = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'dark'; // Default to dark if matchMedia is not available
};

// Function to get default theme based on system preference
const getDefaultThemeId = (): string => {
  const preference = getSystemThemePreference();
  // Find the first theme that matches the system preference
  const defaultTheme = themes.find((theme) => theme.type === preference);
  return defaultTheme
    ? defaultTheme.id
    : preference === 'dark'
    ? 'dark-default'
    : 'light-default';
};

// Check if running in a browser extension environment
const isExtensionContext =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeId,
}) => {
  // Use system preference if no default is provided
  const initialThemeId = defaultThemeId || getDefaultThemeId();
  const [theme, setTheme] = useState<Theme>(getThemeById(initialThemeId));

  const setThemeById = (id: string) => {
    const newTheme = getThemeById(id);
    setTheme(newTheme);

    // Save theme preference to storage
    if (isExtensionContext) {
      try {
        chrome.storage.sync.set({ themeId: id });
      } catch (e) {
        console.warn('Error saving theme to storage:', e);
      }
    }

    // Apply theme to document
    applyTheme(newTheme);
  };

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    // Set CSS variables without using Object.entries
    for (const key in theme.colors) {
      if (Object.prototype.hasOwnProperty.call(theme.colors, key)) {
        const value = theme.colors[key as keyof typeof theme.colors];
        root.style.setProperty(`--${key}`, value);
      }
    }

    // Set dark/light mode
    if (theme.type === 'dark') {
      root.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Only update if no theme is saved in storage
      if (isExtensionContext) {
        chrome.storage.sync.get(['themeId'], (result) => {
          if (!result.themeId) {
            setThemeById(getDefaultThemeId());
          }
        });
      } else {
        setThemeById(getDefaultThemeId());
      }
    };

    // Add event listener for theme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Load theme from storage on mount
  useEffect(() => {
    if (isExtensionContext) {
      try {
        chrome.storage.sync.get(['themeId'], (result) => {
          if (result.themeId) {
            setThemeById(result.themeId);
          } else {
            // Apply system preference theme if none is stored
            setThemeById(getDefaultThemeId());
          }
        });
      } catch (e) {
        console.warn('Error loading theme from storage:', e);
        // Apply system preference theme if storage is not available
        setThemeById(getDefaultThemeId());
      }
    } else {
      setThemeById(getDefaultThemeId());
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setThemeById }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
