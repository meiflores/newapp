import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const theme = {
    ...base,
    colors: { ...base.colors, primary: palette.primary, background: palette.background, card: palette.background },
  };

  return (
    <ThemeProvider value={theme}>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootStack() {
  const { loading, session, profile } = useAuth();
  const loggedIn = !!session;
  const onboarded = !!profile?.onboarded;

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerBackTitle: 'Volver', headerShadowVisible: false }}>
      {/* App principal: logueada y con perfil de belleza completo */}
      <Stack.Protected guard={loggedIn && onboarded}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="producto/[id]" options={{ title: '' }} />
        <Stack.Screen name="resena/[productId]" options={{ title: 'Escribir reseña', presentation: 'modal' }} />
        <Stack.Screen name="elegir-producto" options={{ title: '¿Qué querés reseñar?', presentation: 'modal' }} />
        <Stack.Screen name="sugerir-producto" options={{ title: 'Sugerir producto', presentation: 'modal' }} />
      </Stack.Protected>

      {/* Primer ingreso (y edición del perfil de belleza) */}
      <Stack.Protected guard={loggedIn}>
        <Stack.Screen name="perfil-belleza" options={{ title: 'Tu perfil de belleza' }} />
      </Stack.Protected>

      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
      </Stack.Protected>
    </Stack>
  );
}
