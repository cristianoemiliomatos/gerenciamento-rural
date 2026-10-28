import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { EmptyState } from '@/components/EmptyState';
import { MetricCard } from '@/components/MetricCard';
import { PageContainer } from '@/components/PageContainer';

export default function HomeScreen() {
  return (
    <PageContainer>
      <View>
        <Text variant="headlineMedium" style={styles.title}>Visão geral</Text>
        <Text variant="bodyMedium">Acompanhe seu estoque e as atividades da fazenda.</Text>
      </View>

      <EmptyState
        title="Comece cadastrando um insumo"
        description="Cadastre um produto e registre uma entrada para começar a controlar o estoque local."
        actionLabel="Ir para estoque"
        onAction={() => router.push('/(tabs)/estoque')}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>Resumo do estoque</Text>
      <View style={styles.metrics}>
        <MetricCard label="Produtos" value="—" description="Indicador real será adicionado na Fase 4" />
        <MetricCard label="Valor estimado" value="—" description="Será calculado pelo estoque real" />
        <MetricCard label="Abaixo do mínimo" value="—" description="Será exibido no painel de alertas" />
        <MetricCard label="Vencimentos" value="—" description="Lotes próximos ou vencidos" />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Ações rápidas</Text>
      <View style={styles.actions}>
        <Button mode="contained" icon="plus" contentStyle={styles.button} onPress={() => router.push('/(tabs)/estoque')}>
          Cadastrar produto
        </Button>
        <Button mode="outlined" icon="leaf" contentStyle={styles.button} onPress={() => router.push('/(tabs)/aplicacoes')}>
          Registrar aplicação
        </Button>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontWeight: '700', marginTop: 4 },
  metrics: { gap: 12 },
  actions: { gap: 12 },
  button: { minHeight: 48 },
});
