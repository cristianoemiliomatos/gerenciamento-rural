import { Stack, router } from 'expo-router';

import { ProductForm } from '@/components/ProductForm';
import { PageContainer } from '@/components/PageContainer';
import { createProduct } from '@/database/repositories/stockRepository';

export default function NewProductScreen() {
  return (
    <PageContainer>
      <Stack.Screen options={{ headerShown: true, title: 'Novo produto' }} />
      <ProductForm
        submitLabel="Salvar produto"
        onSubmit={async (product) => {
          const saved = await createProduct(product);
          router.replace({ pathname: '/products/[id]', params: { id: saved.id } });
        }}
      />
    </PageContainer>
  );
}
