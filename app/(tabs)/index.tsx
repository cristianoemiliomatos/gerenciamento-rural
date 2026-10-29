import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { AppHeader } from '@/components/AppHeader';
import { MetricCard } from '@/components/MetricCard';
import { PageContainer } from '@/components/PageContainer';
import { StatusPill } from '@/components/StatusPill';
import { palette } from '@/constants/theme';
import { listExpenses } from '@/database/repositories/farmRepository';
import { listMovements, listProducts } from '@/database/repositories/stockRepository';
import type { Expense } from '@/types/farm';
import type { Product, StockMovement } from '@/types/stock';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProducts, nextMovements, nextExpenses] = await Promise.all([listProducts(), listMovements(), listExpenses()]);
      setProducts(nextProducts);
      setMovements(nextMovements.slice(0, 3));
      setExpenses(nextExpenses);
    } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const alerts = products.filter((product) => product.currentStock <= product.minimumStock).length;
  const stockUnits = products.reduce((total, product) => total + product.currentStock, 0);
  const monthlyCost = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <PageContainer contentContainerStyle={styles.content}>
      <View style={styles.topbar}>
        <View><Text style={styles.greeting}>Olá, Lucas!</Text><Text style={styles.subGreeting}>Aqui está o resumo da sua propriedade</Text></View>
        <View style={styles.avatar}><Ionicons name="person-outline" size={21} color={palette.green} /></View>
      </View>
      <AppHeader title="Visão geral" subtitle="Fazenda Boa Vista" actionIcon="notifications-outline" />
      {loading ? <ActivityIndicator accessibilityLabel="Carregando resumo" /> : null}
      <View style={styles.metrics}>
        <MetricCard label="Produtos ativos" value={String(products.length)} description="no estoque" icon="cube-outline" />
        <MetricCard label="Itens em estoque" value={String(stockUnits)} description="unidades" icon="layers-outline" tone="purple" />
        <MetricCard label="Gastos" value={money.format(monthlyCost)} description="valor registrado" icon="cash-outline" tone="yellow" />
        <MetricCard label="Alertas" value={String(alerts)} description="requer atenção" icon="warning-outline" tone="red" />
      </View>

      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Últimos registros</Text><TouchableOpacity onPress={() => router.push('/(tabs)/estoque')}><Text style={styles.seeAll}>Ver todos</Text></TouchableOpacity></View>
      <View style={styles.records}>
        {!loading && movements.length === 0 ? <Text style={styles.empty}>Seus registros recentes aparecerão aqui.</Text> : null}
        {movements.map((movement) => <RecordRow key={movement.id} movement={movement} />)}
      </View>

      <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/products/new')}><Ionicons name="add" size={20} color="#FFFFFF" /><Text style={styles.primaryActionText}>Adicionar insumo</Text></TouchableOpacity>
    </PageContainer>
  );
}

function RecordRow({ movement }: { movement: StockMovement }) {
  const isEntry = movement.movementType === 'entry';
  const title = isEntry ? 'Entrada de insumo' : movement.movementType === 'loss' ? 'Perda registrada' : 'Saída de insumo';
  return <View style={styles.record}><View style={styles.recordIcon}><Ionicons name={isEntry ? 'arrow-down-outline' : 'arrow-up-outline'} size={18} color={palette.green} /></View><View style={styles.recordCopy}><Text style={styles.recordTitle}>{movement.productName}</Text><Text style={styles.recordMeta}>{title} · {new Date(movement.occurredAt).toLocaleDateString('pt-BR')}</Text></View><StatusPill label={isEntry ? 'Entrada' : 'Saída'} tone={isEntry ? 'success' : 'warning'} /></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14 },
  topbar: { alignItems: 'center', backgroundColor: palette.green, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -16, marginTop: -14, paddingHorizontal: 20, paddingVertical: 18 },
  greeting: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subGreeting: { color: '#D7F1E6', fontSize: 11, marginTop: 3 },
  avatar: { alignItems: 'center', backgroundColor: '#FFFFFFDD', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: palette.darkGreen, fontSize: 16, fontWeight: '800' },
  seeAll: { color: palette.green, fontSize: 12, fontWeight: '700' },
  records: { backgroundColor: palette.card, borderColor: palette.border, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  record: { alignItems: 'center', borderBottomColor: palette.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 66, paddingHorizontal: 12 },
  recordIcon: { alignItems: 'center', backgroundColor: palette.mint, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  recordCopy: { flex: 1 },
  recordTitle: { color: palette.darkGreen, fontSize: 13, fontWeight: '700' },
  recordMeta: { color: palette.muted, fontSize: 10, marginTop: 3 },
  empty: { color: palette.muted, padding: 18, textAlign: 'center' },
  primaryAction: { alignItems: 'center', backgroundColor: palette.green, borderRadius: 13, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, marginTop: 2 },
  primaryActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
