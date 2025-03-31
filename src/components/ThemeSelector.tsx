'use client';

import type React from 'react';
import { themes } from '../types/theme';
import { useTheme } from './ThemeProvider';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  onClose?: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose }) => {
  const { theme: currentTheme, setThemeById } = useTheme();

  const handleThemeChange = (themeId: string) => {
    setThemeById(themeId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="p-2">
      <h3 className="text-sm font-medium mb-3">Select Theme</h3>
      <div className="grid grid-cols-1 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`flex items-center justify-between p-2 rounded-md transition-colors ${
              currentTheme.id === theme.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
            style={{
              backgroundColor:
                theme.id === currentTheme.id ? theme.colors.primary : undefined,
              color:
                theme.id === currentTheme.id
                  ? theme.colors.background
                  : undefined,
            }}
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-gray-400"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <span>{theme.name}</span>
            </div>
            {currentTheme.id === theme.id && <Check size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
