import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar, Stars, VerifiedBadge } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { disclosureBadge, skinLabel, VERIFIED_LABEL } from '@/lib/beauty';
import type { FeedReview } from '@/lib/types';

export function ReviewCard({
  review,
  votedByMe,
  isMine,
  onToggleVote,
}: {
  review: FeedReview;
  votedByMe: boolean;
  isMine: boolean;
  onToggleVote: () => void;
}) {
  const theme = useTheme();
  const name = review.display_name || review.username || 'Usuaria';
  const skin = [
    skinLabel(review.skin_type_snapshot) && `Piel ${skinLabel(review.skin_type_snapshot)?.toLowerCase()}`,
    review.sensitive_snapshot && 'sensible',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.header}>
        <Avatar uri={review.avatar_url} name={name} size={36} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            {review.is_verified ? <VerifiedBadge /> : null}
          </View>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {[review.is_verified && review.verified_kind && VERIFIED_LABEL[review.verified_kind], skin]
              .filter(Boolean)
              .join(' · ') || `@${review.username ?? ''}`}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' }}>
        <Stars value={review.rating} />
        <Tag text={disclosureBadge(review.disclosure) ?? ''} strong={review.disclosure !== 'compra'} />
        {review.would_repurchase === true ? <Tag text="Lo volvería a comprar" /> : null}
        {review.would_repurchase === false ? <Tag text="No lo recompraría" /> : null}
      </View>

      {review.title ? <Text style={[styles.title, { color: theme.text }]}>{review.title}</Text> : null}
      <Text style={[styles.body, { color: theme.text }]}>{review.body}</Text>

      <View style={styles.footer}>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {new Date(review.created_at).toLocaleDateString('es-AR')}
        </Text>
        {isMine ? null : (
          <Pressable onPress={onToggleVote} hitSlop={8}>
            <Text style={{ color: votedByMe ? theme.primary : theme.textSecondary, fontWeight: '600', fontSize: 13 }}>
              {votedByMe ? '♥ Te sirvió' : '♡ Me sirvió'} · {review.helpful_count}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Tag({ text, strong }: { text: string; strong?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: strong ? theme.primary : theme.backgroundSelected },
      ]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: strong ? theme.onPrimary : theme.text }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.large, padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
});
