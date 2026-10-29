import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, HelperText, Menu, Text, TextInput } from 'react-native-paper';

import { AppHeader } from '@/components/AppHeader';
import { PageContainer } from '@/components/PageContainer';
import { palette } from '@/constants/theme';
import { createExpense, listPlots } from '@/database/repositories/farmRepository';
import { listProducts } from '@/database/repositories/stockRepository';
import { expenseCategories, type ExpenseCategory, type Plot } from '@/types/farm';
import type { Product } from '@/types/stock';

export default function NewExpenseScreen() {
  const { plotId: initialPlotId } = useLocalSearchParams<{ plotId?: string }>();
  const [plots, setPlots] = useState<Plot[]>([]); const [products, setProducts] = useState<Product[]>([]);
  const [description, setDescription] = useState(''); const [amount, setAmount] = useState(''); const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('Insumos'); const [plotId, setPlotId] = useState(initialPlotId); const [productId, setProductId] = useState<string>(); const [notes, setNotes] = useState('');
  const [plotMenu, setPlotMenu] = useState(false); const [productMenu, setProductMenu] = useState(false); const [categoryMenu, setCategoryMenu] = useState(false); const [error, setError] = useState<string>(); const [saving, setSaving] = useState(false);

  useEffect(() => { Promise.all([listPlots(), listProducts()]).then(([nextPlots, nextProducts]) => { setPlots(nextPlots); setProducts(nextProducts); }).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os dados.')); }, []);
  const selectedPlot = useMemo(() => plots.find((plot) => plot.id === plotId), [plotId, plots]); const selectedProduct = useMemo(() => products.find((product) => product.id === productId), [productId, products]);
  const save = async () => { setError(undefined); if (!plotId) { setError('Selecione um talhão.'); return; } setSaving(true); try { await createExpense({ description, amount: Number(amount.replace(',', '.')), expenseDate: date, category, plotId, productId, notes }); router.back(); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o gasto.'); } finally { setSaving(false); } };

  return <PageContainer><Stack.Screen options={{ headerShown: false }} /><AppHeader title="Adicionar gasto" subtitle="Associe o valor a um talhão e produto" back />
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Descrição do gasto *" placeholder="Ex.: Compra de sementes" value={description} onChangeText={setDescription} />
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Valor (R$) *" placeholder="0,00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Data *" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
    <Text style={styles.label}>Categoria *</Text><Menu visible={categoryMenu} onDismiss={() => setCategoryMenu(false)} anchor={<Button mode="outlined" textColor={palette.darkGreen} onPress={() => setCategoryMenu(true)}>{category}</Button>}>{expenseCategories.map((item) => <Menu.Item key={item} title={item} onPress={() => { setCategory(item); setCategoryMenu(false); }} />)}</Menu>
    <Text style={styles.label}>Talhão *</Text><Menu visible={plotMenu} onDismiss={() => setPlotMenu(false)} anchor={<Button mode="outlined" textColor={palette.darkGreen} onPress={() => setPlotMenu(true)}>{selectedPlot?.name || 'Selecionar talhão'}</Button>}>{plots.map((plot) => <Menu.Item key={plot.id} title={`${plot.name} · ${plot.areaHectares} ha`} onPress={() => { setPlotId(plot.id); setPlotMenu(false); }} />)}</Menu>
    <Text style={styles.label}>Produto (opcional)</Text><Menu visible={productMenu} onDismiss={() => setProductMenu(false)} anchor={<Button mode="outlined" textColor={palette.darkGreen} onPress={() => setProductMenu(true)}>{selectedProduct?.name || 'Nenhum produto associado'}</Button>}><Menu.Item title="Nenhum produto associado" onPress={() => { setProductId(undefined); setProductMenu(false); }} />{products.map((product) => <Menu.Item key={product.id} title={product.name} onPress={() => { setProductId(product.id); setProductMenu(false); }} />)}</Menu>
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Observações" value={notes} onChangeText={setNotes} multiline />
    <HelperText type="error" visible={Boolean(error)}>{error}</HelperText><Button mode="contained" buttonColor={palette.green} onPress={save} loading={saving} disabled={saving} contentStyle={styles.submit}>Salvar gasto</Button>
  </PageContainer>;
}

const styles = StyleSheet.create({ label: { color: palette.darkGreen, fontSize: 13, fontWeight: '700', marginTop: 2 }, submit: { minHeight: 48 } });
