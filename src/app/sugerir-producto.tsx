import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Body, Button, Chip, ChipRow, Field, Screen, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type Category = { id: number; name: string; vertical: string };

export default function SugerirProductoScreen() {
  const { nombre } = useLocalSearchParams<{ nombre?: string }>();
  const { session } = useAuth();

  const [brand, setBrand] = useState('');
  const [name, setName] = useState(nombre ?? '');
  const [variant, setVariant] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, vertical')
      .not('parent_id', 'is', null)
      .order('vertical')
      .order('sort')
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  const canSave = brand.trim().length >= 1 && name.trim().length >= 2;

  async function save() {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from('product_suggestions').insert({
      user_id: session.user.id,
      brand_name: brand.trim(),
      product_name: name.trim(),
      variant: variant.trim() || null,
      category_id: categoryId,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      Alert.alert('No se pudo enviar', error.message);
      return;
    }
    Alert.alert('¡Gracias!', 'Lo vamos a revisar. Cuando esté cargado vas a poder encontrarlo y reseñarlo.', [
      { text: 'Listo', onPress: () => router.back() },
    ]);
  }

  const makeup = categories.filter((c) => c.vertical === 'makeup');
  const skincare = categories.filter((c) => c.vertical === 'skincare');

  return (
    <Screen edges={['bottom']}>
      <Body muted>Contanos qué producto falta y lo sumamos a la app.</Body>
      <Field label="Marca" value={brand} onChangeText={setBrand} placeholder="ej: Maybelline" />
      <Field label="Nombre del producto" value={name} onChangeText={setName} placeholder="ej: Fit Me Matte" />
      <Field label="Tono o tamaño (opcional)" value={variant} onChangeText={setVariant} placeholder="ej: 120 Ivory · 30 ml" />

      <SectionTitle>Categoría (opcional)</SectionTitle>
      {[
        { title: 'Makeup', items: makeup },
        { title: 'Skincare', items: skincare },
      ].map((group) =>
        group.items.length ? (
          <View key={group.title} style={{ gap: Spacing.two }}>
            <Body muted style={{ fontSize: 13, fontWeight: '600' }}>
              {group.title}
            </Body>
            <ChipRow>
              {group.items.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  selected={categoryId === c.id}
                  onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
                />
              ))}
            </ChipRow>
          </View>
        ) : null,
      )}

      <Field label="¿Algo más? (opcional)" value={notes} onChangeText={setNotes} multiline maxLength={500} placeholder="Dónde lo compraste, link, etc." />

      <Button label="Enviar sugerencia" onPress={save} loading={saving} disabled={!canSave} style={{ marginTop: Spacing.two }} />
    </Screen>
  );
}
