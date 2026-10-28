import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

export function MetricCard({ label, value, description }: MetricCardProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${value}. ${description}`}
      style={[styles.card, { borderColor: theme.colors.outlineVariant }]}
    >
      <Text variant="labelLarge">{label}</Text>
      <Text variant="headlineSmall" style={styles.value}>{value}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    minHeight: 118,
    padding: 16,
  },
  value: {
    fontWeight: '700',
  },
});
