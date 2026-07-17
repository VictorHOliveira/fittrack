import { useState, useEffect } from 'react';
import { Stack, ThemeProvider, DarkTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { COR_FUNDO, COR_CARD, COR_PRIMARIA } from '../src/utils/theme';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COR_FUNDO,
    card: COR_CARD,
    primary: COR_PRIMARIA,
  },
};

export default function RootLayout() {
  const [splashPronto, setSplashPronto] = useState(false);

  useEffect(() => {
    if (splashPronto) {
      SplashScreen.hideAsync();
    }
  }, [splashPronto]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSplashPronto(true);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider value={CustomDarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COR_FUNDO },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login/index" />
            <Stack.Screen name="register/index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="treino/[id]"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Treino',
              }}
            />
            <Stack.Screen
              name="treino/executar/[id]"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Executando Treino',
              }}
            />
            <Stack.Screen
              name="criar-treino/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Criar Treino',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="exercicios/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Exercícios',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="treino-predefinido"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Treino Pré-definido',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="medidas/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Medidas Corporais',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="concluidos/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Concluídos',
              }}
            />
            <Stack.Screen
              name="resumo-treino/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Compartilhar Treino',
              }}
            />
            <Stack.Screen
              name="compartilhar/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Compartilhar',
              }}
            />
            <Stack.Screen
              name="selecionar-exercicio/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Selecionar Exercício',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="iniciar-treino/index"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COR_FUNDO },
                headerTintColor: '#fff',
                headerTitle: 'Iniciar Treino',
              }}
            />
            <Stack.Screen name="agua" options={{ headerShown: false }} />
            <Stack.Screen name="cardio" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
