import '@/global.css';

import { Platform } from 'react-native';

// Nombre provisorio: cambiarlo acá (y en app.json) cuando esté definido
export const APP_NAME = 'Fana';

export const Colors = {
  light: {
    text: '#2B1F22',
    background: '#FFF9F7',
    backgroundElement: '#F6ECE9',
    backgroundSelected: '#EBD9D4',
    textSecondary: '#7A6A6E',
    primary: '#B4436C',
    onPrimary: '#FFFFFF',
    border: '#E8D8D3',
    star: '#E0A31B',
    danger: '#C62828',
  },
  dark: {
    text: '#F7EEF0',
    background: '#151112',
    backgroundElement: '#241C1E',
    backgroundSelected: '#33282B',
    textSecondary: '#B9A9AD',
    primary: '#E58AA8',
    onPrimary: '#2B1F22',
    border: '#3A2E31',
    star: '#F2B93B',
    danger: '#EF7B7B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { small: 8, medium: 14, large: 22, full: 999 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
