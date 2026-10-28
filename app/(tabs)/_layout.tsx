import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const tabIcons = {
  index: 'home-outline',
  estoque: 'cube-outline',
  aplicacoes: 'leaf-outline',
  relatorios: 'bar-chart-outline',
  mais: 'menu-outline',
} as const;

export default function TabLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerTitleAlign: 'left',
      tabBarActiveTintColor: '#2F6B3B',
      tabBarInactiveTintColor: '#596057',
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      tabBarStyle: { minHeight: 64, paddingTop: 5 },
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={tabIcons[route.name as keyof typeof tabIcons]} color={color} size={size} />
      ),
    })}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarAccessibilityLabel: 'Início' }} />
      <Tabs.Screen name="estoque" options={{ title: 'Estoque', tabBarAccessibilityLabel: 'Estoque' }} />
      <Tabs.Screen name="aplicacoes" options={{ title: 'Aplicações', tabBarAccessibilityLabel: 'Aplicações' }} />
      <Tabs.Screen name="relatorios" options={{ title: 'Relatórios', tabBarAccessibilityLabel: 'Relatórios' }} />
      <Tabs.Screen name="mais" options={{ title: 'Mais', tabBarAccessibilityLabel: 'Mais opções' }} />
    </Tabs>
  );
}
