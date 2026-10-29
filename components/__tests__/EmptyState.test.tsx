import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { EmptyState } from '@/components/EmptyState';
import { appTheme } from '@/constants/theme';

describe('EmptyState', () => {
  it('explica o próximo passo e expõe uma ação acessível', async () => {
    const onAction = jest.fn();

    const { getByText, getByLabelText } = await render(
      <PaperProvider theme={appTheme}>
        <EmptyState
          title="Sem produtos"
          description="Cadastre um produto para começar."
          actionLabel="Cadastrar produto"
          onAction={onAction}
        />
      </PaperProvider>,
    );

    expect(getByText('Sem produtos')).toBeTruthy();
    expect(getByLabelText('Cadastrar produto')).toBeTruthy();
  });
});
