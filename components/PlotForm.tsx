import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { palette } from '@/constants/theme';
import type { PlotDraft } from '@/types/farm';

type PlotFormProps = { initialValue?: PlotDraft; submitLabel: string; onSubmit: (value: PlotDraft) => Promise<void> };

const emptyPlot: PlotDraft = { name: '', areaHectares: 0, crop: '', notes: '' };

export function PlotForm({ initialValue = emptyPlot, submitLabel, onSubmit }: PlotFormProps) {
  const [value, setValue] = useState<PlotDraft>(initialValue);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const update = <Key extends keyof PlotDraft>(key: Key, nextValue: PlotDraft[Key]) => setValue((current) => ({ ...current, [key]: nextValue }));
  const save = async () => { setError(undefined); setSaving(true); try { await onSubmit({ ...value, name: value.name.trim(), areaHectares: Number(String(value.areaHectares).replace(',', '.')) }); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o talhão.'); } finally { setSaving(false); } };

  return <View style={styles.form}>
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Nome do talhão *" value={value.name} onChangeText={(text) => update('name', text)} />
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Área em hectares *" value={String(value.areaHectares || '')} onChangeText={(text) => update('areaHectares', text === '' ? 0 : Number(text.replace(',', '.')))} keyboardType="decimal-pad" />
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Cultura" placeholder="Ex.: Cebola" value={value.crop} onChangeText={(text) => update('crop', text)} />
    <TextInput mode="outlined" outlineColor={palette.border} activeOutlineColor={palette.green} label="Observações" value={value.notes} onChangeText={(text) => update('notes', text)} multiline />
    <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
    <Button mode="contained" buttonColor={palette.green} onPress={save} loading={saving} disabled={saving} contentStyle={styles.submit}>{submitLabel}</Button>
  </View>;
}

const styles = StyleSheet.create({ form: { gap: 10 }, submit: { minHeight: 48 } });
