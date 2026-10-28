import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${description}`}
      style={[styles.container, { backgroundColor: theme.colors.secondaryContainer }]}
    >
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} accessibilityLabel={actionLabel}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderRadius: 16,
    gap: 10,
    padding: 20,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    lineHeight: 21,
  },
});
