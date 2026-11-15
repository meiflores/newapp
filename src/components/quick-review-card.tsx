import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Acceso rápido en la home: lleva a elegir el producto que se quiere reseñar */
export function QuickReviewCard() {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.text }]}>¿Qué probaste últimamente?</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Contale a la comunidad qué te funcionó y qué no.
      </Text>
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Buscar un producto para reseñar"
        onPress={() => router.push('/elegir-producto')}
        style={({ pressed }) => [
          styles.fakeInput,
          { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
        ]}>
        <Text style={{ color: theme.textSecondary, fontSize: 16 }}>🔍  Buscá el producto…</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.large, padding: Spacing.three, gap: Spacing.two },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  fakeInput: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    marginTop: Spacing.one,
  },
});
