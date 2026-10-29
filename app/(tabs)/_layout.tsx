import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { palette } from '@/constants/theme';

const tabIcons = {
  index: 'home-outline',
  estoque: 'cube-outline',
  aplicacoes: 'map-outline',
  relatorios: 'wallet-outline',
  mais: 'menu-outline',
} as const;

export default function TabLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: palette.green,
      tabBarInactiveTintColor: '#78908A',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 3 },
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: palette.border, height: 70, paddingTop: 7 },
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={tabIcons[route.name as keyof typeof tabIcons]} color={typeof color === 'string' ? color : palette.green} size={size} />
      ),
    })}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarAccessibilityLabel: 'Início' }} />
      <Tabs.Screen name="estoque" options={{ title: 'Insumos', tabBarAccessibilityLabel: 'Insumos' }} />
      <Tabs.Screen name="aplicacoes" options={{ title: 'Talhões', tabBarAccessibilityLabel: 'Talhões' }} />
      <Tabs.Screen name="relatorios" options={{ title: 'Gastos', tabBarAccessibilityLabel: 'Gastos' }} />
      <Tabs.Screen name="mais" options={{ title: 'Mais', tabBarAccessibilityLabel: 'Mais opções' }} />
    </Tabs>
  );
}
