import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette } from '@/constants/theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.row, compact && styles.compact]}>
      <View style={styles.icon}>
        <Ionicons name="leaf" size={compact ? 18 : 25} color="#FFFFFF" />
      </View>
      <Text style={[styles.wordmark, compact && styles.compactText]}>Agro<Text style={styles.accent}>Gest</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  compact: { gap: 6 },
  icon: { alignItems: 'center', backgroundColor: palette.green, borderRadius: 14, height: 38, justifyContent: 'center', transform: [{ rotate: '-12deg' }], width: 38 },
  wordmark: { color: palette.darkGreen, fontSize: 25, fontWeight: '800', letterSpacing: -1 },
  compactText: { fontSize: 19 },
  accent: { color: '#55A92A' },
});
