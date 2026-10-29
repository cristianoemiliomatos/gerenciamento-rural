import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette } from '@/constants/theme';

export function StatusPill({ label, tone = 'success' }: { label: string; tone?: 'success' | 'warning' | 'danger' }) {
  const colors = tone === 'danger' ? { bg: '#FDE8E8', text: '#C93636' } : tone === 'warning' ? { bg: '#FFF3D7', text: '#A66B00' } : { bg: '#D9F6E7', text: palette.green };
  return <View style={[styles.pill, { backgroundColor: colors.bg }]}><Text style={[styles.text, { color: colors.text }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  pill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  text: { fontSize: 10, fontWeight: '800' },
});
