import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const MAX_REVIEW_PHOTOS = 3;

/** Una foto de la reseña: ya subida (path) o recién elegida del celu (uri) */
export type ReviewPhoto =
  | { kind: 'saved'; id: number; path: string; url: string }
  | { kind: 'new'; uri: string; mimeType?: string | null };

export function ReviewPhotosPicker({
  photos,
  onChange,
}: {
  photos: ReviewPhoto[];
  onChange: (photos: ReviewPhoto[]) => void;
}) {
  const theme = useTheme();
  const left = MAX_REVIEW_PHOTOS - photos.length;

  async function add() {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: left,
      quality: 0.6,
    });
    if (picked.canceled) return;
    const added: ReviewPhoto[] = picked.assets
      .slice(0, left)
      .map((a) => ({ kind: 'new', uri: a.uri, mimeType: a.mimeType }));
    onChange([...photos, ...added]);
  }

  return (
    <View style={styles.row}>
      {photos.map((p, i) => (
        <View key={p.kind === 'saved' ? `s${p.id}` : `n${p.uri}`}>
          <Image source={{ uri: p.kind === 'saved' ? p.url : p.uri }} style={styles.thumb} contentFit="cover" />
          <Pressable
            onPress={() => onChange(photos.filter((_, j) => j !== i))}
            accessibilityLabel="Quitar foto"
            hitSlop={8}
            style={[styles.remove, { backgroundColor: theme.text }]}>
            <Text style={{ color: theme.background, fontSize: 13, fontWeight: '700' }}>✕</Text>
          </Pressable>
        </View>
      ))}
      {left > 0 ? (
        <Pressable
          onPress={add}
          accessibilityRole="button"
          accessibilityLabel="Agregar fotos"
          style={[styles.thumb, styles.add, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <Text style={{ fontSize: 28, color: theme.textSecondary }}>＋</Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>Foto</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  thumb: { width: 96, height: 96, borderRadius: Radius.medium },
  add: { borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
