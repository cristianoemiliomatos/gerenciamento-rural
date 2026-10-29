import { Stack, router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { PageContainer } from '@/components/PageContainer';
import { PlotForm } from '@/components/PlotForm';
import { createPlot } from '@/database/repositories/farmRepository';

export default function NewPlotScreen() {
  return <PageContainer><Stack.Screen options={{ headerShown: false }} /><AppHeader title="Adicionar talhão" subtitle="Cadastre uma área da propriedade" back /><PlotForm submitLabel="Salvar talhão" onSubmit={async (draft) => { await createPlot(draft); router.back(); }} /></PageContainer>;
}
