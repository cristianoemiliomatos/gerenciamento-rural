import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, HelperText, Menu, RadioButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { PageContainer } from '@/components/PageContainer';
import { listLots, listProducts, recordConsumption, recordEntry } from '@/database/repositories/stockRepository';
import type { ExpirationKind, Lot, Product, StockMovementType } from '@/types/stock';

type MovementKind = Extract<StockMovementType, 'entry' | 'exit' | 'loss'>;

function toTimestamp(day: string): string {
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error('Informe uma data válida.');
  return date.toISOString();
}

export default function NewMovementScreen() {
  const params = useLocalSearchParams<{ productId?: string; type?: MovementKind }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(params.productId);
  const [lots, setLots] = useState<Lot[]>([]);
  const [movementType, setMovementType] = useState<MovementKind>(params.type ?? 'entry');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [productMenuVisible, setProductMenuVisible] = useState(false);
  const [lotMenuVisible, setLotMenuVisible] = useState(false);
  const [lotId, setLotId] = useState<string>();
  const [lotCode, setLotCode] = useState('');
  const [expirationKind, setExpirationKind] = useState<ExpirationKind>('known');
  const [expirationDate, setExpirationDate] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(() => products.find((product) => product.id === productId), [productId, products]);

  useEffect(() => { listProducts().then(setProducts).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os produtos.')); }, []);
  useEffect(() => {
    if (!productId) { setLots([]); return; }
    listLots(productId).then(setLots).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os lotes.'));
  }, [productId]);

  const save = async () => {
    setError(undefined);
    if (!productId) { setError('Selecione um produto.'); return; }
    const parsedQuantity = Number(quantity.replace(',', '.'));
    setSaving(true);
    try {
      if (movementType === 'entry') {
        await recordEntry({
          productId, quantity: parsedQuantity, unitCost: Number(unitCost.replace(',', '.')),
          occurredAt: toTimestamp(date), notes,
          ...(lotId ? { lotId } : { newLot: { code: lotCode, expirationKind, expirationDate } }),
        });
      } else {
        await recordConsumption({ productId, quantity: parsedQuantity, occurredAt: toTimestamp(date), type: movementType, notes, lotId });
      }
      if (params.productId) router.back(); else router.replace('/(tabs)/estoque');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível registrar a movimentação.');
    } finally {
      setSaving(false);
    }
  };

  const movementTitle = movementType === 'entry' ? 'Registrar entrada' : movementType === 'exit' ? 'Registrar saída' : 'Registrar perda';

  return (
    <PageContainer>
      <Stack.Screen options={{ headerShown: true, title: movementTitle }} />
      <Text variant="bodyMedium">Cada confirmação atualiza o saldo e cria um registro permanente no histórico.</Text>
      <SegmentedButtons value={movementType} onValueChange={(value) => { setMovementType(value as MovementKind); setLotId(undefined); }} buttons={[
        { value: 'entry', label: 'Entrada' }, { value: 'exit', label: 'Saída' }, { value: 'loss', label: 'Perda' },
      ]} />
      <Menu visible={productMenuVisible} onDismiss={() => setProductMenuVisible(false)} anchor={<Button mode="outlined" onPress={() => setProductMenuVisible(true)}>{selectedProduct?.name || 'Selecionar produto'}</Button>}>
        {products.map((product) => <Menu.Item key={product.id} title={`${product.name} (${product.currentStock} ${product.unit})`} onPress={() => { setProductId(product.id); setLotId(undefined); setProductMenuVisible(false); }} />)}
      </Menu>
      <TextInput label={`Quantidade${selectedProduct ? ` (${selectedProduct.unit})` : ''} *`} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
      <TextInput label="Data * (AAAA-MM-DD)" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
      {movementType === 'entry' ? <>
        <TextInput label="Custo unitário (R$) *" value={unitCost} onChangeText={setUnitCost} keyboardType="decimal-pad" />
        <Divider />
        <Text variant="titleSmall">Lote da entrada</Text>
        <Menu visible={lotMenuVisible} onDismiss={() => setLotMenuVisible(false)} anchor={<Button mode="outlined" onPress={() => setLotMenuVisible(true)}>{lotId ? (lots.find((lot) => lot.id === lotId)?.code || 'Lote selecionado') : 'Criar novo lote'}</Button>}>
          <Menu.Item title="Criar novo lote" onPress={() => { setLotId(undefined); setLotMenuVisible(false); }} />
          {lots.map((lot) => <Menu.Item key={lot.id} title={`${lot.code || 'Sem código'} (${lot.currentQuantity} ${selectedProduct?.unit ?? ''})`} onPress={() => { setLotId(lot.id); setLotMenuVisible(false); }} />)}
        </Menu>
        {!lotId ? <View style={styles.lotForm}>
          <TextInput label="Código do lote" value={lotCode} onChangeText={setLotCode} />
          <Text variant="labelLarge">Validade</Text>
          <RadioButton.Group value={expirationKind} onValueChange={(value) => setExpirationKind(value as ExpirationKind)}>
            <RadioButton.Item label="Data conhecida" value="known" position="leading" />
            <RadioButton.Item label="Desconhecida" value="unknown" position="leading" />
            <RadioButton.Item label="Produto sem validade" value="not_applicable" position="leading" />
          </RadioButton.Group>
          {expirationKind === 'known' ? <TextInput label="Validade * (AAAA-MM-DD)" value={expirationDate} onChangeText={setExpirationDate} keyboardType="numbers-and-punctuation" /> : null}
        </View> : null}
      </> : <>
        <Text variant="bodySmall">Sem seleção de lote, a saída usa automaticamente os lotes válidos com vencimento mais próximo (FEFO).</Text>
        <Menu visible={lotMenuVisible} onDismiss={() => setLotMenuVisible(false)} anchor={<Button mode="outlined" onPress={() => setLotMenuVisible(true)}>{lotId ? (lots.find((lot) => lot.id === lotId)?.code || 'Lote selecionado') : 'Usar FEFO automaticamente'}</Button>}>
          <Menu.Item title="Usar FEFO automaticamente" onPress={() => { setLotId(undefined); setLotMenuVisible(false); }} />
          {lots.map((lot) => <Menu.Item key={lot.id} title={`${lot.code || 'Sem código'} (${lot.currentQuantity} ${selectedProduct?.unit ?? ''})`} onPress={() => { setLotId(lot.id); setLotMenuVisible(false); }} />)}
        </Menu>
      </>}
      <TextInput label="Observações" value={notes} onChangeText={setNotes} multiline />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <Button mode="contained" onPress={save} loading={saving} disabled={saving} contentStyle={styles.submit}>Confirmar {movementTitle.toLowerCase()}</Button>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  lotForm: { gap: 8 },
  submit: { minHeight: 48 },
});
