import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Avatar, Body, Button, Chip, ChipRow, Empty, Screen, SectionTitle, Stars, Title, VerifiedBadge } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { concernLabel, skinLabel, undertoneLabel, VERIFIED_LABEL } from '@/lib/beauty';
import { publicUrl, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type MyReview = {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  product: { id: string; name: string; brand: { name: string } | null } | null;
};

export default function PerfilScreen() {
  const theme = useTheme();
  const { profile, session, refreshProfile, signOut } = useAuth();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      supabase
        .from('reviews')
        .select('id, rating, body, created_at, product:products(id, name, brand:brands(name))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setReviews((data as unknown as MyReview[]) ?? []));
    }, [session]),
  );

  async function changeAvatar() {
    if (!session) return;
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    setUploading(true);
    try {
      const bytes = await fetch(asset.uri).then((r) => r.arrayBuffer());
      const path = `${session.user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, bytes, { contentType: asset.mimeType ?? 'image/jpeg', upsert: true });
      if (error) throw error;
      await supabase.from('profiles').update({ avatar_url: publicUrl('avatars', path) }).eq('id', session.user.id);
      await refreshProfile();
    } catch {
      Alert.alert('No se pudo subir la foto', 'Probá de nuevo en un rato.');
    } finally {
      setUploading(false);
    }
  }

  if (!profile) return null;
  const name = profile.display_name || profile.username;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: Spacing.two }}>
        <Pressable onPress={changeAvatar} disabled={uploading} accessibilityLabel="Cambiar foto de perfil">
          <Avatar uri={profile.avatar_url} name={name} size={96} />
          <Text style={{ textAlign: 'center', color: theme.primary, marginTop: Spacing.one, fontSize: 13 }}>
            {uploading ? 'Subiendo…' : 'Cambiar foto'}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
          <Title>{name}</Title>
          {profile.is_verified ? <VerifiedBadge /> : null}
        </View>
        <Body muted>
          @{profile.username}
          {profile.is_verified && profile.verified_kind ? ` · ${VERIFIED_LABEL[profile.verified_kind]}` : ''}
        </Body>
        {profile.bio ? <Body style={{ textAlign: 'center' }}>{profile.bio}</Body> : null}
      </View>

      <SectionTitle>Mi perfil de belleza</SectionTitle>
      <ChipRow>
        {profile.skin_type ? <Chip label={`Piel ${skinLabel(profile.skin_type)?.toLowerCase()}`} /> : null}
        {profile.sensitive_skin ? <Chip label="Sensible" /> : null}
        {profile.skin_tone ? <Chip label={`Tono ${profile.skin_tone.toLowerCase()}`} /> : null}
        {profile.undertone ? <Chip label={`Subtono ${undertoneLabel(profile.undertone)?.toLowerCase()}`} /> : null}
        {profile.concerns.map((c) => (
          <Chip key={c} label={concernLabel(c)} />
        ))}
      </ChipRow>
      <Button label="Editar perfil" variant="secondary" onPress={() => router.push('/perfil-belleza')} />

      <SectionTitle>Mis reseñas ({reviews.length})</SectionTitle>
      {reviews.length === 0 ? (
        <Empty text="Todavía no escribiste reseñas." />
      ) : (
        reviews.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => r.product && router.push({ pathname: '/producto/[id]', params: { id: r.product.id } })}
            style={{ backgroundColor: theme.backgroundElement, borderRadius: Radius.medium, padding: Spacing.three, gap: 4 }}>
            <Body style={{ fontWeight: '700' }}>
              {r.product?.brand?.name} · {r.product?.name}
            </Body>
            <Stars value={r.rating} />
            <Body muted numberOfLines={2}>
              {r.body}
            </Body>
          </Pressable>
        ))
      )}

      <Button label="Cerrar sesión" variant="ghost" onPress={signOut} style={{ marginTop: Spacing.four }} />
    </Screen>
  );
}
