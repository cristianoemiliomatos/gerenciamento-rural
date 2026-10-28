import { StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';

import { PageContainer } from '@/components/PageContainer';

export default function MoreScreen() {
  return (
    <PageContainer>
      <View>
        <Text variant="headlineSmall" style={styles.title}>Mais opções</Text>
        <Text variant="bodyMedium">Configurações e recursos do aplicativo.</Text>
      </View>
      <List.Section>
        <List.Item
          title="Proteção por PIN"
          description="Será configurada na Fase 5"
          left={(props) => <List.Icon {...props} icon="lock-outline" />}
          accessibilityLabel="Proteção por PIN. Será configurada na Fase 5"
        />
        <List.Item
          title="Backup e restauração"
          description="Será disponibilizado na Fase 5"
          left={(props) => <List.Icon {...props} icon="backup-restore" />}
          accessibilityLabel="Backup e restauração. Será disponibilizado na Fase 5"
        />
        <List.Item
          title="Sobre o AgroGest"
          description="Versão 0.1.0 — fundação do projeto"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
          accessibilityLabel="Sobre o AgroGest. Versão 0.1.0, fundação do projeto"
        />
      </List.Section>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 4 },
});
