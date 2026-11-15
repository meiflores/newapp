import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Body, Button, Field, Screen, Title } from '@/components/ui';
import { APP_NAME, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('No pudimos iniciar sesión', 'Revisá el mail y la contraseña.');
  }

  async function resetPassword() {
    if (!email.trim()) {
      Alert.alert('Escribí tu mail', 'Poné tu mail arriba y te mandamos un link para cambiar la contraseña.');
      return;
    }
    await supabase.auth.resetPasswordForEmail(email.trim());
    Alert.alert('Listo', 'Si el mail está registrado, te llega un link para cambiar la contraseña.');
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', gap: Spacing.three }}>
        <View style={{ gap: Spacing.one, marginBottom: Spacing.three }}>
          <Title>{APP_NAME}</Title>
          <Body muted>Reseñas reales de makeup y skincare, de gente con tu tipo de piel.</Body>
        </View>
        <Field
          label="Mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        <Button label="Entrar" onPress={signIn} loading={loading} disabled={!email || !password} />
        <Button label="Me olvidé la contraseña" variant="ghost" onPress={resetPassword} />
        <Button label="Crear cuenta" variant="secondary" onPress={() => router.push('/registro')} />
      </View>
    </Screen>
  );
}
