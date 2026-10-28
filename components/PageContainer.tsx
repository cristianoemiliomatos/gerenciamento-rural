import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';

import { layout } from '@/constants/theme';

type PageContainerProps = PropsWithChildren<ScrollViewProps>;

export function PageContainer({ children, contentContainerStyle, ...props }: PageContainerProps) {
  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: layout.contentGap,
    padding: layout.screenPadding,
    paddingBottom: 36,
  },
});
