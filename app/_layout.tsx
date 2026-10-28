import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appTheme } from '@/constants/theme';
import { DatabaseProvider, useDatabaseStatus } from '@/providers/DatabaseProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <StatusBar style="dark" />
        <DatabaseProvider>
          <AppNavigator />
        </DatabaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { isReady, error, retry } = useDatabaseStatus();

  if (error) {
    return (
      <View style={styles.status} accessibilityRole="alert">
        <Text variant="headlineSmall">Não foi possível abrir os dados locais</Text>
        <Text variant="bodyMedium">{error.message}</Text>
        <Button mode="contained" onPress={retry}>Tentar novamente</Button>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.status} accessibilityRole="progressbar" accessibilityLabel="Preparando banco de dados local">
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge">Preparando seus dados locais…</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  status: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
});
