import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { MAX_REVIEW_PHOTOS, ReviewPhotosPicker, type ReviewPhoto } from '@/components/review-photos-picker';
import { Body, Button, Chip, ChipRow, Field, Loading, Screen, SectionTitle, StarPicker } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { DISCLOSURES } from '@/lib/beauty';
import { publicUrl, supabase } from '@/lib/supabase';
import type { Disclosure } from '@/lib/types';
import { extensionFor, uploadImage } from '@/lib/upload';
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
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [originalPhotos, setOriginalPhotos] = useState<{ id: number; path: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // si ya reseñó este producto, carga la reseña (y sus fotos) para editarla
  useEffect(() => {
    if (!userId || !productId) return;
    (async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, review_photos(id, path, sort)')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setRating(data.rating);
        setTitle(data.title ?? '');
        setBody(data.body);
        setRepurchase(data.would_repurchase);
        setDisclosure(data.disclosure);
        const saved = ((data.review_photos ?? []) as { id: number; path: string; sort: number }[]).sort(
          (a, b) => a.sort - b.sort,
        );
        setOriginalPhotos(saved);
        setPhotos(saved.map((p) => ({ kind: 'saved', id: p.id, path: p.path, url: publicUrl('review-photos', p.path) })));
      }
      setLoaded(true);
    })();
  }, [userId, productId]);

  const canSave = rating > 0 && body.trim().length >= MIN_BODY;

  async function syncPhotos(reviewId: string) {
    if (!userId) return;
    // fotos que estaban y se quitaron
    const keptIds = new Set(photos.flatMap((p) => (p.kind === 'saved' ? [p.id] : [])));
    const removed = originalPhotos.filter((p) => !keptIds.has(p.id));
    if (removed.length) {
      await supabase.from('review_photos').delete().in('id', removed.map((p) => p.id));
      await supabase.storage.from('review-photos').remove(removed.map((p) => p.path));
    }
    // fotos nuevas: se suben y se guardan en orden
    const startSort = photos.filter((p) => p.kind === 'saved').length;
    const fresh = photos.filter((p): p is Extract<ReviewPhoto, { kind: 'new' }> => p.kind === 'new');
    for (const [i, p] of fresh.entries()) {
      const path = `${userId}/${reviewId}/${Date.now()}-${i}.${extensionFor(p.mimeType)}`;
      await uploadImage('review-photos', path, p.uri, p.mimeType);
      const { error } = await supabase.from('review_photos').insert({ review_id: reviewId, path, sort: startSort + i });
      if (error) throw error;
    }
  }

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
    const result = existingId
      ? await supabase.from('reviews').update(values).eq('id', existingId).select('id').single()
      : await supabase.from('reviews').insert({ ...values, product_id: productId, user_id: userId }).select('id').single();

    if (result.error || !result.data) {
      setSaving(false);
      Alert.alert('No se pudo guardar la reseña', result.error?.message ?? 'Probá de nuevo.');
      return;
    }

    try {
      await syncPhotos(result.data.id);
    } catch {
      setSaving(false);
      Alert.alert('Tu reseña se guardó', 'Pero alguna foto no se pudo subir. Probá agregarla de nuevo editando la reseña.');
      router.back();
      return;
    }
    setSaving(false);
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
          if (originalPhotos.length) {
            await supabase.storage.from('review-photos').remove(originalPhotos.map((p) => p.path));
          }
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

      <SectionTitle>Fotos (opcional)</SectionTitle>
      <Body muted style={{ fontSize: 13 }}>
        Hasta {MAX_REVIEW_PHOTOS}. Mostrá cómo queda, la textura o el antes y después.
      </Body>
      <ReviewPhotosPicker photos={photos} onChange={setPhotos} />

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
