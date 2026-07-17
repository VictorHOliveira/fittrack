import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COR_PRIMARIA } from '../../src/utils/theme';

export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COR_PRIMARIA,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          display: 'none',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="treinos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
