import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductTile } from '@/components/product-card';
import { QuickReviewCard } from '@/components/quick-review-card';
import { Body, Empty, Loading, SectionTitle, Title } from '@/components/ui';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import type { ProductCard } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [launches, setLaunches] = useState<ProductCard[] | null>(null);
  const [popular, setPopular] = useState<ProductCard[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const base = () => supabase.from('product_cards').select('*').eq('status', 'aprobado').limit(12);
    const [l, p] = await Promise.all([
      base().not('launch_date', 'is', null).order('launch_date', { ascending: false }),
      base().order('review_count', { ascending: false }).order('avg_rating', { ascending: false }),
    ]);
    setLaunches((l.data as ProductCard[]) ?? []);
    setPopular((p.data as ProductCard[]) ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.four }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        <View>
          <Title>Hola{profile?.display_name ? `, ${profile.display_name}` : ''} ✨</Title>
          <Body muted>¿Qué querés probar hoy?</Body>
        </View>

        <QuickReviewCard />

        <Carousel title="Últimos lanzamientos" items={launches} />
        <Carousel title="Lo más reseñado" items={popular} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Carousel({ title, items }: { title: string; items: ProductCard[] | null }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <SectionTitle>{title}</SectionTitle>
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty text="Todavía no hay productos acá." />
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProductTile product={item} />}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.three }} />}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}
