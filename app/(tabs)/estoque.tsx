import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { PageContainer } from '@/components/PageContainer';
import { StatusPill } from '@/components/StatusPill';
import { palette } from '@/constants/theme';
import { listProducts } from '@/database/repositories/stockRepository';
import type { Product } from '@/types/stock';

const filters = ['Todos', 'Fertilizante', 'Defensivo', 'Semente'];

export default function StockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try { setProducts(await listProducts()); setError(undefined); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o estoque.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void loadProducts(); }, [loadProducts]));

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesText = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'Todos' || (product.categoryName ?? '').toLowerCase().includes(filter.toLowerCase().replace('defensivo', 'defensivo agrícola'));
    return matchesText && matchesFilter;
  }), [filter, products, search]);

  return (
    <PageContainer>
      <AppHeader title="Insumos" subtitle="Controle de produtos e estoque" actionIcon="options-outline" />
      <Searchbar placeholder="Buscar insumo..." value={search} onChangeText={setSearch} style={styles.search} inputStyle={styles.searchInput} elevation={0} />
      <View style={styles.filters}>{filters.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>)}</View>
      {error ? <EmptyState title="Não foi possível carregar" description={error} actionLabel="Tentar novamente" onAction={() => void loadProducts()} /> : null}
      {loading ? <ActivityIndicator accessibilityLabel="Carregando estoque" /> : null}
      {!loading && !error && products.length === 0 ? <EmptyState title="Nenhum insumo cadastrado" description="Cadastre seu primeiro produto para começar a controlar o estoque." actionLabel="Cadastrar insumo" onAction={() => router.push('/products/new')} /> : null}
      {!loading && !error && products.length > 0 && visibleProducts.length === 0 ? <Text style={styles.noResults}>Nenhum insumo encontrado.</Text> : null}
      <View style={styles.list}>{visibleProducts.map((product) => <ProductRow key={product.id} product={product} />)}</View>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/products/new')}><Ionicons name="add" size={23} color="#FFFFFF" /></TouchableOpacity>
    </PageContainer>
  );
}

function ProductRow({ product }: { product: Product }) {
  const low = product.currentStock <= product.minimumStock;
  const category = product.categoryName ?? 'Insumo';
  return <TouchableOpacity style={styles.row} onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })} accessibilityLabel={`Abrir ${product.name}`}><View style={styles.productIcon}><Ionicons name={category.toLowerCase().includes('semente') ? 'leaf-outline' : 'flask-outline'} size={19} color={low ? '#C58500' : palette.green} /></View><View style={styles.copy}><Text style={styles.name}>{product.name}</Text><Text style={styles.meta}>{category} · {product.currentStock} {product.unit}</Text></View><StatusPill label={low ? 'Atenção' : 'Em estoque'} tone={low ? 'warning' : 'success'} /><Ionicons name="chevron-forward" size={18} color={palette.muted} /></TouchableOpacity>;
}

const styles = StyleSheet.create({
  search: { backgroundColor: '#FFFFFF', borderColor: palette.border, borderRadius: 12, borderWidth: 1, height: 48 },
  searchInput: { fontSize: 13 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: { backgroundColor: '#FFFFFF', borderColor: palette.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  filterActive: { backgroundColor: palette.green, borderColor: palette.green },
  filterText: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  list: { backgroundColor: '#FFFFFF', borderColor: palette.border, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { alignItems: 'center', borderBottomColor: palette.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 76, paddingHorizontal: 12 },
  productIcon: { alignItems: 'center', backgroundColor: palette.mint, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  copy: { flex: 1 },
  name: { color: palette.darkGreen, fontSize: 13, fontWeight: '800' },
  meta: { color: palette.muted, fontSize: 10, marginTop: 3 },
  addButton: { alignItems: 'center', alignSelf: 'flex-end', backgroundColor: palette.green, borderRadius: 28, elevation: 3, height: 54, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5, width: 54 },
  noResults: { color: palette.muted, padding: 18, textAlign: 'center' },
});
