import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Body, Button, Chip, ChipRow, Field, Loading, Screen, SectionTitle, StarPicker } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { DISCLOSURES } from '@/lib/beauty';
import { supabase } from '@/lib/supabase';
import type { Disclosure } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

const MIN_BODY = 20;

export default function EscribirResenaScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [existingId, setExistingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [repurchase, setRepurchase] = useState<boolean | null>(null);
  const [disclosure, setDisclosure] = useState<Disclosure>('compra');
  const [saving, setSaving] = useState(false);

  // si ya reseñó este producto, carga la reseña para editarla
  useEffect(() => {
    if (!userId || !productId) return;
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id);
          setRating(data.rating);
          setTitle(data.title ?? '');
          setBody(data.body);
          setRepurchase(data.would_repurchase);
          setDisclosure(data.disclosure);
        }
        setLoaded(true);
      });
  }, [userId, productId]);

  const canSave = rating > 0 && body.trim().length >= MIN_BODY;

  async function save() {
    if (!userId || !productId) return;
    setSaving(true);
    const values = {
      rating,
      title: title.trim() || null,
      body: body.trim(),
      would_repurchase: repurchase,
      disclosure,
    };
    const { error } = existingId
      ? await supabase.from('reviews').update(values).eq('id', existingId)
      : await supabase.from('reviews').insert({ ...values, product_id: productId, user_id: userId });
    setSaving(false);
    if (error) {
      Alert.alert('No se pudo guardar la reseña', error.message);
      return;
    }
    router.back();
  }

  function confirmDelete() {
    if (!existingId) return;
    Alert.alert('¿Borrar tu reseña?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('reviews').delete().eq('id', existingId);
          router.back();
        },
      },
    ]);
  }

  if (!loaded) return <Loading />;

  return (
    <Screen edges={['bottom']}>
      <SectionTitle>¿Cuántas estrellas le das?</SectionTitle>
      <StarPicker value={rating} onChange={setRating} />

      <Field label="Título (opcional)" value={title} onChangeText={setTitle} maxLength={80} />
      <Field
        label={`Tu experiencia (mínimo ${MIN_BODY} caracteres)`}
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={3000}
        placeholder="¿Cómo te quedó? ¿Cuánto dura? ¿Te dio alguna reacción?"
      />
      <Body muted style={{ fontSize: 13, marginTop: -Spacing.two }}>
        {body.trim().length}/{MIN_BODY}
      </Body>

      <SectionTitle>¿Lo volverías a comprar?</SectionTitle>
      <ChipRow>
        <Chip label="Sí" selected={repurchase === true} onPress={() => setRepurchase(repurchase === true ? null : true)} />
        <Chip label="No" selected={repurchase === false} onPress={() => setRepurchase(repurchase === false ? null : false)} />
      </ChipRow>

      <SectionTitle>¿Cómo lo conseguiste?</SectionTitle>
      <Body muted style={{ fontSize: 13 }}>Esto se muestra en tu reseña para que sea transparente.</Body>
      <ChipRow>
        {DISCLOSURES.map((d) => (
          <Chip key={d.value} label={d.label} selected={disclosure === d.value} onPress={() => setDisclosure(d.value)} />
        ))}
      </ChipRow>

      <View style={{ gap: Spacing.two, marginTop: Spacing.three }}>
        <Button label={existingId ? 'Guardar cambios' : 'Publicar reseña'} onPress={save} loading={saving} disabled={!canSave} />
        {existingId ? <Button label="Borrar reseña" variant="ghost" onPress={confirmDelete} /> : null}
      </View>
    </Screen>
  );
}
