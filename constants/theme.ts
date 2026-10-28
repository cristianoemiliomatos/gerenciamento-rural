import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2F6B3B',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D8EBD7',
    onPrimaryContainer: '#173A20',
    secondary: '#526453',
    secondaryContainer: '#DCE8DA',
    onSecondaryContainer: '#263526',
    tertiary: '#765A22',
    surface: '#FBFCF8',
    surfaceVariant: '#E7EAE4',
    onSurface: '#1A1C19',
    onSurfaceVariant: '#43483F',
    outline: '#73796E',
    error: '#B3261E',
  },
};

export const layout = {
  screenPadding: 20,
  contentGap: 16,
} as const;
