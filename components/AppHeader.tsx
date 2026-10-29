import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  back?: boolean;
  actionIcon?: IconName;
  onAction?: () => void;
};

export function AppHeader({ title, subtitle, back, actionIcon, onAction }: AppHeaderProps) {
  return (
    <View style={styles.row}>
      {back ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={21} color={palette.darkGreen} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.copy}>
        <Text variant="headlineSmall" style={styles.title}>{title}</Text>
        {subtitle ? <Text variant="bodySmall" style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionIcon ? (
        <TouchableOpacity onPress={onAction} style={styles.action} accessibilityLabel="Ação da tela">
          <Ionicons name={actionIcon} size={21} color={palette.darkGreen} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  back: { marginRight: 10, padding: 5 },
  copy: { flex: 1 },
  title: { color: palette.darkGreen, fontSize: 22, fontWeight: '800' },
  subtitle: { color: palette.muted, marginTop: 2 },
  action: { alignItems: 'center', borderColor: palette.border, borderRadius: 20, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
});
