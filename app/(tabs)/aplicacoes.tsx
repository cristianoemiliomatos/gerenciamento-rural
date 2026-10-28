import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { PageContainer } from '@/components/PageContainer';

export default function ApplicationsScreen() {
  return (
    <PageContainer>
      <EmptyState
        title="Aplicações em preparação"
        description="Na Fase 3, você registrará aplicações por propriedade, talhão e cultura, com baixa de estoque e custo calculados juntos."
        actionLabel="Ver estoque"
        onAction={() => router.push('/(tabs)/estoque')}
      />
    </PageContainer>
  );
}
