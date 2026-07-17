import { Stack } from 'expo-router';
import { COR_FUNDO } from '../../src/utils/theme';

export default function AguaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COR_FUNDO },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Tomar Água',
        }}
      />
      <Stack.Screen
        name="config"
        options={{
          headerTitle: 'Configurar Água',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
