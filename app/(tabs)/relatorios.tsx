import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { PageContainer } from '@/components/PageContainer';

export default function ReportsScreen() {
  return (
    <PageContainer>
      <EmptyState
        title="Relatórios em preparação"
        description="Na Fase 4, os relatórios usarão somente dados reais do aplicativo e poderão ser exportados em CSV."
        actionLabel="Voltar ao início"
        onAction={() => router.replace('/(tabs)')}
      />
    </PageContainer>
  );
}
