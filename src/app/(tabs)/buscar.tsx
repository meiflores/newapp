import { useEffect, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductRow } from '@/components/product-card';
import { Empty, Loading, Title } from '@/components/ui';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import type { ProductCard } from '@/lib/types';

export default function BuscarScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const searching = query.trim().length >= 2;
  const shown = searching ? results : null;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    // espera a que la persona deje de escribir
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.rpc('search_products', { q });
      setResults((data as ProductCard[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: Spacing.three, gap: Spacing.three }}>
        <Title>Buscar</Title>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Producto, marca o categoría"
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
          renderItem={({ item }) => <ProductRow product={item} />}
          contentContainerStyle={{ padding: Spacing.three, paddingTop: 0, gap: Spacing.three, paddingBottom: BottomTabInset }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            shown === null ? (
              <Empty text="Probá con “sérum”, “protector” o una marca." />
            ) : (
              <Empty text="No encontramos nada con eso." />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
