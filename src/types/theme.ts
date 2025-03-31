export type ThemeType = 'light' | 'dark';

export interface Theme {
  id: string;
  name: string;
  type: ThemeType;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    card: string;
    cardForeground: string;
    weekLived: string;
    weekRemaining: string;
    currentYear: string;
  };
}

export const themes: Theme[] = [
  // Light themes
  {
    id: 'light-default',
    name: 'Light',
    type: 'light',
    colors: {
      background: '#f8f9fa',
      foreground: '#1a1a1a',
      primary: '#14b8a6',
      secondary: '#64748b',
      accent: '#0ea5e9',
      muted: '#e2e8f0',
      border: '#cbd5e1',
      card: '#ffffff',
      cardForeground: '#1a1a1a',
      weekLived: '#10b981',
      weekRemaining: '#94a3b8',
      currentYear: '#f59e0b',
    },
  },
  {
    id: 'light-sepia',
    name: 'Sepia',
    type: 'light',
    colors: {
      background: '#f5f0e8',
      foreground: '#433422',
      primary: '#9c6644',
      secondary: '#7c5f4a',
      accent: '#d97706',
      muted: '#e7e0d0',
      border: '#d3c6b4',
      card: '#fffbf5',
      cardForeground: '#433422',
      weekLived: '#84cc16',
      weekRemaining: '#a8a29e',
      currentYear: '#d97706',
    },
  },
  // Dark themes
  {
    id: 'dark-default',
    name: 'Dark',
    type: 'dark',
    colors: {
      background: '#111827',
      foreground: '#f8fafc',
      primary: '#14b8a6',
      secondary: '#64748b',
      accent: '#0ea5e9',
      muted: '#334155',
      border: '#475569',
      card: '#1e293b',
      cardForeground: '#f8fafc',
      weekLived: '#10b981',
      weekRemaining: '#64748b',
      currentYear: '#f59e0b',
    },
  },
  {
    id: 'dark-midnight',
    name: 'Midnight',
    type: 'dark',
    colors: {
      background: '#0f172a',
      foreground: '#e2e8f0',
      primary: '#6366f1',
      secondary: '#64748b',
      accent: '#8b5cf6',
      muted: '#1e293b',
      border: '#334155',
      card: '#1e293b',
      cardForeground: '#e2e8f0',
      weekLived: '#818cf8',
      weekRemaining: '#475569',
      currentYear: '#c084fc',
    },
  },
  {
    id: 'dark-matrix',
    name: 'Matrix',
    type: 'dark',
    colors: {
      background: '#0c0c0c',
      foreground: '#ccffcc',
      primary: '#00ff00',
      secondary: '#00cc00',
      accent: '#33ff33',
      muted: '#1a1a1a',
      border: '#003300',
      card: '#0f170f',
      cardForeground: '#ccffcc',
      weekLived: '#00cc00',
      weekRemaining: '#1a3d1a',
      currentYear: '#66ff66',
    },
  },
];

export const getThemeById = (id: string): Theme => {
  return themes.find((theme) => theme.id === id) || themes[2]; // Default to dark theme
};
