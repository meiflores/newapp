import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Body, Button, Field, Screen } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function RegistroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (password.length < 8) {
      Alert.alert('Contraseña muy corta', 'Usá al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('No pudimos crear la cuenta', error.message);
      return;
    }
    if (!data.session) {
      // Supabase tiene activada la confirmación por mail
      Alert.alert('Revisá tu mail', 'Te mandamos un link para confirmar la cuenta. Después volvé y entrá.');
      router.back();
    }
    // si hay sesión, la navegación pasa sola al perfil de belleza
  }

  return (
    <Screen edges={['bottom']}>
      <Body muted>Con tu mail y una contraseña. Después armamos tu perfil de belleza.</Body>
      <Field
        label="Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Field
        label="Contraseña (mínimo 8 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <Button label="Crear cuenta" onPress={signUp} loading={loading} disabled={!email || !password} />
    </Screen>
  );
}
