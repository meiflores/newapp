import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import { Body, Button, Chip, ChipRow, Field, Screen, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CONCERNS, SKIN_TONES, SKIN_TYPES, UNDERTONES } from '@/lib/beauty';
import { supabase } from '@/lib/supabase';
import type { SkinType, Undertone } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

export default function PerfilBellezaScreen() {
  const theme = useTheme();
  const { session, profile, refreshProfile, signOut } = useAuth();
  const editing = !!profile?.onboarded;

  const [username, setUsername] = useState(profile?.username ?? '');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [skinType, setSkinType] = useState<SkinType | null>(profile?.skin_type ?? null);
  const [sensitive, setSensitive] = useState(profile?.sensitive_skin ?? false);
  const [tone, setTone] = useState<string | null>(profile?.skin_tone ?? null);
  const [undertone, setUndertone] = useState<Undertone | null>(profile?.undertone ?? null);
  const [concerns, setConcerns] = useState<string[]>(profile?.concerns ?? []);
  const [saving, setSaving] = useState(false);

  const cleanUsername = username.trim().toLowerCase();
  const validUsername = /^[a-z0-9_.]{3,24}$/.test(cleanUsername);

  async function save() {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        skin_type: skinType,
        sensitive_skin: sensitive,
        skin_tone: tone,
        undertone,
        concerns,
        onboarded: true,
      })
      .eq('id', session.user.id);
    setSaving(false);

    if (error) {
      const taken = error.code === '23505';
      Alert.alert(taken ? 'Ese usuario ya existe' : 'No se pudo guardar', taken ? 'Probá con otro.' : error.message);
      return;
    }
    await refreshProfile();
    if (editing) router.back();
    // en el primer ingreso, la navegación pasa sola a la app
  }

  const toggleConcern = (v: string) =>
    setConcerns((prev) => (prev.includes(v) ? prev.filter((c) => c !== v) : [...prev, v]));

  return (
    <Screen edges={['bottom']}>
      {!editing ? (
        <Body muted>
          Esto sirve para mostrarte reseñas de gente con piel parecida a la tuya. Solo el usuario es obligatorio.
        </Body>
      ) : null}

      <Field
        label="Usuario (letras, números, punto o guion bajo)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="ej: mei.flores"
      />
      <Field label="Nombre para mostrar" value={displayName} onChangeText={setDisplayName} />
      <Field label="Bio" value={bio} onChangeText={setBio} multiline maxLength={280} />

      <SectionTitle>Tipo de piel</SectionTitle>
      <ChipRow>
        {SKIN_TYPES.map((s) => (
          <Chip
            key={s.value}
            label={s.label}
            selected={skinType === s.value}
            onPress={() => setSkinType(skinType === s.value ? null : s.value)}
          />
        ))}
      </ChipRow>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Body>Tengo piel sensible</Body>
        <Switch value={sensitive} onValueChange={setSensitive} trackColor={{ true: theme.primary }} />
      </View>

      <SectionTitle>Tono de piel</SectionTitle>
      <ChipRow>
        {SKIN_TONES.map((t) => (
          <Chip key={t} label={t} selected={tone === t} onPress={() => setTone(tone === t ? null : t)} />
        ))}
      </ChipRow>

      <SectionTitle>Subtono</SectionTitle>
      <ChipRow>
        {UNDERTONES.map((u) => (
          <Chip
            key={u.value}
            label={u.label}
            selected={undertone === u.value}
            onPress={() => setUndertone(undertone === u.value ? null : u.value)}
          />
        ))}
      </ChipRow>

      <SectionTitle>¿Qué te preocupa de tu piel?</SectionTitle>
      <ChipRow>
        {CONCERNS.map((c) => (
          <Chip
            key={c.value}
            label={c.label}
            selected={concerns.includes(c.value)}
            onPress={() => toggleConcern(c.value)}
          />
        ))}
      </ChipRow>

      <View style={{ gap: Spacing.two, marginTop: Spacing.three }}>
        <Button label={editing ? 'Guardar cambios' : 'Listo'} onPress={save} loading={saving} disabled={!validUsername} />
        {!editing ? <Button label="Cerrar sesión" variant="ghost" onPress={signOut} /> : null}
      </View>
    </Screen>
  );
}
