import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native-paper';

import { ProductForm } from '@/components/ProductForm';
import { PageContainer } from '@/components/PageContainer';
import { getProduct, updateProduct } from '@/database/repositories/stockRepository';
import type { Product, ProductDraft } from '@/types/stock';

export default function EditProductScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!productId) return;
    getProduct(productId).then(setProduct).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o produto.'));
  }, [productId]);

  const initialValue: ProductDraft | undefined = product ? {
    name: product.name, categoryName: (product.categoryName ?? 'Outro') as ProductDraft['categoryName'],
    description: product.description ?? '', manufacturer: product.manufacturer ?? '', supplier: product.supplier ?? '',
    unit: product.unit, minimumStock: product.minimumStock, notes: product.notes ?? '',
  } : undefined;

  return (
    <PageContainer>
      <Stack.Screen options={{ headerShown: true, title: 'Editar produto' }} />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      {!product && !error ? <ActivityIndicator accessibilityLabel="Carregando produto" /> : null}
      {initialValue ? <ProductForm initialValue={initialValue} submitLabel="Salvar alterações" onSubmit={async (draft) => {
        await updateProduct(product.id, draft);
        router.back();
      }} /> : null}
    </PageContainer>
  );
}
