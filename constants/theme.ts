import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#08785C',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D9F2E6',
    onPrimaryContainer: '#064A38',
    secondary: '#4C665D',
    secondaryContainer: '#E4F1EB',
    onSecondaryContainer: '#17352B',
    tertiary: '#A2710B',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F6F3',
    onSurface: '#12332D',
    onSurfaceVariant: '#60736E',
    outline: '#D7E4DF',
    error: '#B3261E',
  },
};

export const layout = {
  screenPadding: 16,
  contentGap: 14,
} as const;

export const palette = {
  background: '#F4F8F6',
  card: '#FFFFFF',
  green: '#08785C',
  darkGreen: '#064A38',
  mint: '#E4F6ED',
  muted: '#60736E',
  border: '#E0ECE7',
  warning: '#F0A51A',
  danger: '#E34B4B',
  purple: '#8467D9',
} as const;
