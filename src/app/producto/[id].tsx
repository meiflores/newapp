import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { ReviewCard } from '@/components/review-card';
import {
  Body,
  Button,
  Chip,
  ChipRow,
  Empty,
  Loading,
  ProductImage,
  Screen,
  SectionTitle,
  Stars,
  Title,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { skinLabel } from '@/lib/beauty';
import { supabase } from '@/lib/supabase';
import type { FeedReview, ProductCard, ProductDetail } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

type Filter = 'todas' | 'como-yo';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, profile } = useAuth();
  const userId = session?.user.id;

  const [card, setCard] = useState<ProductCard | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<FeedReview[] | null>(null);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [wantToTry, setWantToTry] = useState(false);
  const [filter, setFilter] = useState<Filter>('todas');
  const [showIngredients, setShowIngredients] = useState(false);

  const load = useCallback(async () => {
    if (!id || !userId) return;
    const [c, d, r, l] = await Promise.all([
      supabase.from('product_cards').select('*').eq('id', id).maybeSingle(),
      supabase.from('products').select('id, description, ingredients').eq('id', id).maybeSingle(),
      supabase
        .from('review_feed')
        .select('*')
        .eq('product_id', id)
        .order('helpful_count', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('list_items').select('kind').eq('product_id', id).eq('user_id', userId).eq('kind', 'quiero_probar'),
    ]);
    setCard(c.data as ProductCard | null);
    setDetail(d.data as ProductDetail | null);
    const list = (r.data as FeedReview[]) ?? [];
    setReviews(list);
    setWantToTry((l.data ?? []).length > 0);

    if (list.length) {
      const { data: votes } = await supabase
        .from('review_votes')
        .select('review_id')
        .eq('user_id', userId)
        .in('review_id', list.map((x) => x.id));
      setMyVotes(new Set((votes ?? []).map((v) => v.review_id as string)));
    }
  }, [id, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const myReview = reviews?.find((r) => r.user_id === userId);
  const mySkin = profile?.skin_type;
  const visible =
    filter === 'como-yo' && mySkin ? (reviews ?? []).filter((r) => r.skin_type_snapshot === mySkin) : (reviews ?? []);

  async function toggleVote(review: FeedReview) {
    if (!userId) return;
    const voted = myVotes.has(review.id);
    // actualización optimista
    setMyVotes((prev) => {
      const next = new Set(prev);
      if (voted) next.delete(review.id);
      else next.add(review.id);
      return next;
    });
    setReviews((prev) =>
      prev?.map((r) => (r.id === review.id ? { ...r, helpful_count: r.helpful_count + (voted ? -1 : 1) } : r)) ?? null,
    );
    if (voted) {
      await supabase.from('review_votes').delete().eq('review_id', review.id).eq('user_id', userId);
    } else {
      await supabase.from('review_votes').insert({ review_id: review.id, user_id: userId });
    }
  }

  async function toggleWantToTry() {
    if (!userId || !id) return;
    setWantToTry(!wantToTry);
    if (wantToTry) {
      await supabase.from('list_items').delete().match({ user_id: userId, product_id: id, kind: 'quiero_probar' });
    } else {
      await supabase.from('list_items').insert({ user_id: userId, product_id: id, kind: 'quiero_probar' });
    }
  }

  if (!card) {
    return (
      <Screen edges={[]}>
        {reviews === null ? <Loading /> : <Empty text="No encontramos este producto." />}
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <View style={{ alignItems: 'center' }}>
        <ProductImage uri={card.image_url} size={220} />
      </View>

      <View style={{ gap: Spacing.one }}>
        <Body muted style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {card.brand_name} · {card.category_name}
        </Body>
        <Title>{card.name}</Title>
        {card.variant ? <Body muted>{card.variant}</Body> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <Stars value={Number(card.avg_rating)} size={18} />
          <Body muted>
            {card.review_count
              ? `${Number(card.avg_rating).toFixed(1)} · ${card.review_count} reseña${card.review_count === 1 ? '' : 's'}`
              : 'Sin reseñas todavía'}
          </Body>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.two }}>
        <Button
          style={{ flex: 1 }}
          label={myReview ? 'Editar mi reseña' : 'Escribir reseña'}
          onPress={() => router.push({ pathname: '/resena/[productId]', params: { productId: card.id } })}
        />
        <Button
          style={{ flex: 1 }}
          variant="secondary"
          label={wantToTry ? '✓ Quiero probarlo' : '+ Quiero probarlo'}
          onPress={toggleWantToTry}
        />
      </View>

      {detail?.description ? <Body>{detail.description}</Body> : null}

      {detail?.ingredients ? (
        <View style={{ gap: Spacing.one }}>
          <Button
            variant="ghost"
            label={showIngredients ? 'Ocultar ingredientes' : 'Ver ingredientes'}
            onPress={() => setShowIngredients(!showIngredients)}
          />
          {showIngredients ? <Body muted>{detail.ingredients}</Body> : null}
        </View>
      ) : null}

      <SectionTitle>Reseñas</SectionTitle>
      {profile?.skin_type ? (
        <ChipRow>
          <Chip label="Todas" selected={filter === 'todas'} onPress={() => setFilter('todas')} />
          <Chip
            label={`Piel ${skinLabel(profile.skin_type)?.toLowerCase()} como la mía`}
            selected={filter === 'como-yo'}
            onPress={() => setFilter('como-yo')}
          />
        </ChipRow>
      ) : null}

      {reviews === null ? (
        <Loading />
      ) : visible.length === 0 ? (
        <Empty text={filter === 'como-yo' ? 'Todavía no hay reseñas de gente con tu tipo de piel.' : 'Sé la primera en reseñarlo.'} />
      ) : (
        visible.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            isMine={r.user_id === userId}
            votedByMe={myVotes.has(r.id)}
            onToggleVote={() => toggleVote(r)}
          />
        ))
      )}
    </Screen>
  );
}
