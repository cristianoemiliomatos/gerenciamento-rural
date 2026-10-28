import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, FAB, Text } from 'react-native-paper';

import { EmptyState } from '@/components/EmptyState';
import { PageContainer } from '@/components/PageContainer';
import { listProducts } from '@/database/repositories/stockRepository';
import type { Product } from '@/types/stock';

export default function StockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await listProducts());
      setError(undefined);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadProducts(); }, [loadProducts]));

  return (
    <PageContainer>
      <View>
        <Text variant="headlineSmall" style={styles.title}>Estoque</Text>
        <Text variant="bodyMedium">Produtos, lotes e movimentações salvos neste aparelho.</Text>
      </View>
      {error ? <EmptyState title="Não foi possível carregar" description={error} actionLabel="Tentar novamente" onAction={() => void loadProducts()} /> : null}
      {loading ? <ActivityIndicator accessibilityLabel="Carregando estoque" /> : null}
      {!loading && !error && products.length === 0 ? <EmptyState
        title="Nenhum produto cadastrado"
        description="Cadastre o primeiro insumo e depois registre uma entrada com seu lote."
        actionLabel="Cadastrar produto"
        onAction={() => router.push('/products/new')}
      /> : null}
      {products.map((product) => (
        <Card key={product.id} mode="outlined" onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })} accessibilityLabel={`Abrir ${product.name}`}>
          <Card.Content style={styles.card}>
            <View>
              <Text variant="titleMedium">{product.name}</Text>
              <Text variant="bodySmall">{product.categoryName || 'Sem categoria'} · {product.currentStock} {product.unit}</Text>
            </View>
            {product.currentStock <= product.minimumStock ? <Text accessibilityLabel="Abaixo do estoque mínimo" style={styles.warning}>Abaixo do mínimo</Text> : null}
          </Card.Content>
        </Card>
      ))}
      {products.length > 0 ? <Button mode="outlined" icon="swap-vertical" onPress={() => router.push('/movements/new')}>Registrar movimentação</Button> : null}
      <FAB icon="plus" label="Novo produto" onPress={() => router.push('/products/new')} style={styles.fab} accessibilityLabel="Cadastrar novo produto" />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 4 },
  card: { gap: 8 },
  warning: { color: '#8A3B12', fontWeight: '700' },
  fab: { alignSelf: 'flex-end', marginTop: 8 },
});
