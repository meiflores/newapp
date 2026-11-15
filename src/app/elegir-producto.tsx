import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

import { Body, Button, Loading, ProductImage } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import type { ProductCard } from '@/lib/types';

export default function ElegirProductoScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductCard[] | null>(null);
  const [loading, setLoading] = useState(false);

  const q = query.trim();
  const searching = q.length >= 2;
  const shown = searching ? results : null;

  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.rpc('search_products', { q });
      setResults((data as ProductCard[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, searching]);

  const pick = (id: string) => router.replace({ pathname: '/resena/[productId]', params: { productId: id } });
  const suggest = () => router.replace({ pathname: '/sugerir-producto', params: { nombre: q } });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: Spacing.three }}>
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Nombre del producto o marca"
          placeholderTextColor={theme.textSecondary}
          autoCorrect={false}
          returnKeyType="search"
          style={{
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            borderRadius: Radius.full,
            paddingHorizontal: Spacing.four,
            paddingVertical: 12,
            fontSize: 16,
          }}
        />
      </View>

      {loading && searching ? (
        <Loading />
      ) : (
        <FlatList
          data={shown ?? []}
          keyExtractor={(p) => p.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.two }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => pick(item.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.three,
                padding: Spacing.two,
                borderRadius: Radius.medium,
                backgroundColor: pressed ? theme.backgroundElement : 'transparent',
              })}>
              <ProductImage uri={item.image_url} size={52} />
              <View style={{ flex: 1 }}>
                <Body muted style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>
                  {item.brand_name}
                </Body>
                <Body style={{ fontWeight: '600' }} numberOfLines={2}>
                  {item.name}
                  {item.variant ? ` · ${item.variant}` : ''}
                </Body>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            searching ? (
              <View style={{ alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.three }}>
                <Body muted>No encontramos “{q}”.</Body>
              </View>
            ) : (
              <Body muted style={{ textAlign: 'center', paddingTop: Spacing.three }}>
                Escribí al menos dos letras para buscar.
              </Body>
            )
          }
          ListFooterComponent={
            searching ? (
              <View style={{ marginTop: Spacing.four, gap: Spacing.two, alignItems: 'center' }}>
                <Body muted>¿No está el que buscás?</Body>
                <Button label="Sugerir producto" variant="secondary" onPress={suggest} />
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
}
