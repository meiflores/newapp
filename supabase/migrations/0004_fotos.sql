-- Subir fotos necesita que cada usuaria pueda "ver" los archivos de su propia carpeta
-- (Supabase lo chequea al subir). Los buckets son públicos, así que mostrarlas no depende de esto.
create policy "ver mi carpeta" on storage.objects for select to authenticated
  using (
    bucket_id in ('avatars', 'review-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Máximo 3 fotos por reseña
create function public.limit_review_photos()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if (select count(*) from public.review_photos where review_id = new.review_id) >= 3 then
    raise exception 'Máximo 3 fotos por reseña';
  end if;
  return new;
end;
$$;
revoke execute on function public.limit_review_photos() from public, anon, authenticated;

create trigger review_photos_limit
  before insert on public.review_photos
  for each row execute function public.limit_review_photos();

-- La vista de reseñas suma las fotos (rutas dentro del bucket 'review-photos')
create or replace view public.review_feed
with (security_invoker = true) as
select
  r.*,
  pr.username, pr.display_name, pr.avatar_url, pr.is_verified, pr.verified_kind,
  (select count(*) from public.review_votes v where v.review_id = r.id) as helpful_count,
  coalesce(
    (select array_agg(ph.path order by ph.sort, ph.id) from public.review_photos ph where ph.review_id = r.id),
    '{}'
  ) as photo_paths
from public.reviews r
join public.profiles pr on pr.id = r.user_id;
