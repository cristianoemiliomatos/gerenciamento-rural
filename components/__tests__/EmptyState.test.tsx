import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { EmptyState } from '@/components/EmptyState';
import { appTheme } from '@/constants/theme';

describe('EmptyState', () => {
  it('explica o próximo passo e expõe uma ação acessível', () => {
    const onAction = jest.fn();

    render(
      <PaperProvider theme={appTheme}>
        <EmptyState
          title="Sem produtos"
          description="Cadastre um produto para começar."
          actionLabel="Cadastrar produto"
          onAction={onAction}
        />
      </PaperProvider>,
    );

    expect(screen.getByText('Sem produtos')).toBeTruthy();
    expect(screen.getByLabelText('Cadastrar produto')).toBeTruthy();
  });
});
