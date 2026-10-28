import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, Text } from 'react-native-paper';

import { PageContainer } from '@/components/PageContainer';
import { getProduct, listLots, listMovements } from '@/database/repositories/stockRepository';
import type { Lot, Product, StockMovement } from '@/types/stock';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product>();
  const [lots, setLots] = useState<Lot[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [storedProduct, storedLots, storedMovements] = await Promise.all([getProduct(id), listLots(id), listMovements(id)]);
      setProduct(storedProduct);
      setLots(storedLots);
      setMovements(storedMovements);
      setError(undefined);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os dados.');
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!product && !error) return <PageContainer><ActivityIndicator accessibilityLabel="Carregando produto" /></PageContainer>;
  if (!product) return <PageContainer><Text accessibilityRole="alert">{error}</Text></PageContainer>;

  return (
    <PageContainer>
      <Stack.Screen options={{ headerShown: true, title: product.name }} />
      <View style={styles.topActions}>
        <Button mode="outlined" icon="pencil" onPress={() => router.push({ pathname: '/products/edit', params: { productId: product.id } })}>Editar</Button>
        <Button mode="contained" icon="plus" onPress={() => router.push({ pathname: '/movements/new', params: { productId: product.id, type: 'entry' } })}>Entrada</Button>
      </View>
      <Card mode="outlined"><Card.Content style={styles.cardContent}>
        <Text variant="titleMedium">Saldo atual</Text>
        <Text variant="headlineMedium">{product.currentStock} {product.unit}</Text>
        <Text variant="bodyMedium">Custo médio: {money.format(product.averageCost)} por {product.unit}</Text>
        <Text variant="bodySmall">Estoque mínimo: {product.minimumStock} {product.unit}</Text>
        {product.currentStock <= product.minimumStock ? <Chip icon="alert">Abaixo do mínimo</Chip> : null}
      </Card.Content></Card>
      <View style={styles.topActions}>
        <Button mode="outlined" onPress={() => router.push({ pathname: '/movements/new', params: { productId: product.id, type: 'exit' } })}>Registrar saída</Button>
        <Button mode="outlined" onPress={() => router.push({ pathname: '/movements/new', params: { productId: product.id, type: 'loss' } })}>Registrar perda</Button>
      </View>
      <Text variant="titleMedium">Lotes</Text>
      {lots.length === 0 ? <Text>Nenhum lote recebeu entrada ainda.</Text> : lots.map((lot) => (
        <Card key={lot.id} mode="outlined"><Card.Content>
          <Text variant="titleSmall">{lot.code || 'Lote sem código'}</Text>
          <Text>{lot.currentQuantity} {product.unit} · {lot.expirationKind === 'known' ? `Validade: ${lot.expirationDate}` : lot.expirationKind === 'unknown' ? 'Validade desconhecida' : 'Sem prazo de validade'}</Text>
        </Card.Content></Card>
      ))}
      <Divider />
      <Text variant="titleMedium">Histórico</Text>
      {movements.length === 0 ? <Text>Nenhuma movimentação registrada.</Text> : movements.map((movement) => (
        <Card key={movement.id} mode="outlined"><Card.Content>
          <Text variant="titleSmall">{movement.movementType === 'entry' ? 'Entrada' : movement.movementType === 'exit' ? 'Saída' : movement.movementType === 'loss' ? 'Perda' : 'Estorno'} · {movement.quantity} {movement.unit}</Text>
          <Text variant="bodySmall">{new Date(movement.occurredAt).toLocaleDateString('pt-BR')} · Lote: {movement.lotCode || 'sem código'} · {money.format(movement.totalCost)}</Text>
        </Card.Content></Card>
      ))}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  topActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardContent: { gap: 6 },
});
