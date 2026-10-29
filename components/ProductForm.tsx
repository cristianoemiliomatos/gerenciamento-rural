import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, RadioButton, Text, TextInput } from 'react-native-paper';

import { palette } from '@/constants/theme';
import { productCategories, type ProductDraft } from '@/types/stock';

type ProductFormProps = {
  initialValue?: ProductDraft;
  submitLabel: string;
  onSubmit: (value: ProductDraft) => Promise<void>;
};

const emptyProduct: ProductDraft = {
  name: '', categoryName: 'Defensivo agrícola', description: '', manufacturer: '', supplier: '', unit: 'L', minimumStock: 0, notes: '',
};

export function ProductForm({ initialValue = emptyProduct, submitLabel, onSubmit }: ProductFormProps) {
  const [value, setValue] = useState<ProductDraft>(initialValue);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const update = <Key extends keyof ProductDraft>(key: Key, nextValue: ProductDraft[Key]) => {
    setValue((current) => ({ ...current, [key]: nextValue }));
  };

  const save = async () => {
    setError(undefined);
    setSaving(true);
    try {
      await onSubmit({ ...value, minimumStock: Number(value.minimumStock) });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Nome do insumo *" value={value.name} onChangeText={(text) => update('name', text)} autoCapitalize="words" />
      <Text variant="titleSmall" style={styles.label}>Categoria *</Text>
      <RadioButton.Group value={value.categoryName} onValueChange={(categoryName) => update('categoryName', categoryName as ProductDraft['categoryName'])}>
        {productCategories.map((category) => (
          <RadioButton.Item key={category} label={category} value={category} position="leading" accessibilityLabel={`Categoria ${category}`} />
        ))}
      </RadioButton.Group>
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Unidade de medida *" value={value.unit} onChangeText={(text) => update('unit', text)} autoCapitalize="characters" />
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Estoque mínimo" value={String(value.minimumStock)} onChangeText={(text) => update('minimumStock', text === '' ? 0 : Number(text))} keyboardType="decimal-pad" />
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Fabricante" value={value.manufacturer} onChangeText={(text) => update('manufacturer', text)} />
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Fornecedor" value={value.supplier} onChangeText={(text) => update('supplier', text)} />
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Descrição" value={value.description} onChangeText={(text) => update('description', text)} multiline />
      <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Observações" value={value.notes} onChangeText={(text) => update('notes', text)} multiline />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <Button mode="contained" buttonColor={palette.green} onPress={save} loading={saving} disabled={saving} contentStyle={styles.submit}>{submitLabel}</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10 },
  label: { color: palette.darkGreen, marginTop: 2 },
  submit: { minHeight: 48 },
});
