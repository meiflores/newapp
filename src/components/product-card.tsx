import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductImage, Stars } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ProductCard } from '@/lib/types';

const open = (id: string) => router.push({ pathname: '/producto/[id]', params: { id } });

/** Tarjeta vertical, para carruseles de la home */
export function ProductTile({ product }: { product: ProductCard }) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => open(product.id)} style={styles.tile}>
      <ProductImage uri={product.image_url} size={140} />
      <Text numberOfLines={1} style={[styles.brand, { color: theme.textSecondary }]}>
        {product.brand_name}
      </Text>
      <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
        {product.name}
      </Text>
      <Rating product={product} />
    </Pressable>
  );
}

/** Fila horizontal, para listas y resultados */
export function ProductRow({ product }: { product: ProductCard }) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => open(product.id)} style={styles.row}>
      <ProductImage uri={product.image_url} size={72} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[styles.brand, { color: theme.textSecondary }]}>
          {product.brand_name} · {product.category_name}
        </Text>
        <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
          {product.name}
          {product.variant ? <Text style={{ color: theme.textSecondary }}> · {product.variant}</Text> : null}
        </Text>
        <Rating product={product} />
      </View>
    </Pressable>
  );
}

function Rating({ product }: { product: ProductCard }) {
  const theme = useTheme();
  if (!product.review_count) {
    return <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Sin reseñas todavía</Text>;
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
      <Stars value={Number(product.avg_rating)} size={13} />
      <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
        {Number(product.avg_rating).toFixed(1)} ({product.review_count})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { width: 140, gap: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  brand: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
});
