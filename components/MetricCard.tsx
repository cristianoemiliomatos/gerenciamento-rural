import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette } from '@/constants/theme';

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'green' | 'yellow' | 'purple' | 'red';
};

export function MetricCard({ label, value, description, icon = 'cube-outline', tone = 'green' }: MetricCardProps) {
  const backgrounds = { green: '#DDF5E9', yellow: '#FFF1D0', purple: '#EDE7FF', red: '#FCE5E5' };
  const iconColors = { green: palette.green, yellow: '#C58500', purple: palette.purple, red: palette.danger };

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${value}. ${description}`}
      style={[styles.card, { backgroundColor: backgrounds[tone] }]}
    >
      <View style={styles.icon}><Ionicons name={icon} size={17} color={iconColors[tone]} /></View>
      <Text variant="labelSmall" style={styles.label}>{label}</Text>
      <Text variant="titleLarge" style={styles.value}>{value}</Text>
      <Text variant="bodySmall" style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    gap: 5,
    minHeight: 112,
    padding: 12,
    width: '48%',
  },
  icon: { alignItems: 'center', backgroundColor: '#FFFFFFAA', borderRadius: 12, height: 30, justifyContent: 'center', width: 30 },
  label: { color: palette.muted, fontWeight: '600' },
  value: { color: palette.darkGreen, fontWeight: '800' },
  description: { color: palette.muted, fontSize: 10 },
});
