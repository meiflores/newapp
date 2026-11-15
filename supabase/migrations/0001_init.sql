-- =====================================================================
-- Esquema inicial de la app de reseñas de belleza (makeup + skincare)
-- Correr en Supabase: SQL Editor > New query > pegar todo > Run
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.skin_type as enum ('seca', 'grasa', 'mixta', 'normal');
create type public.undertone as enum ('frio', 'calido', 'neutro', 'oliva');
create type public.user_role as enum ('user', 'admin');
create type public.verified_kind as enum ('creadora', 'profesional', 'marca');
-- 'tools' queda listo para sumar beauty tools más adelante
create type public.vertical as enum ('makeup', 'skincare', 'tools');
create type public.product_status as enum ('pendiente', 'aprobado', 'rechazado');
-- cómo consiguió el producto quien reseña: transparencia frente a reseñas pagas
create type public.disclosure as enum ('compra', 'regalo', 'publi');
create type public.list_kind as enum ('quiero_probar', 'rutina', 'terminado');
create type public.report_target as enum ('review', 'product', 'profile');
create type public.report_status as enum ('abierto', 'resuelto', 'descartado');

-- ---------------------------------------------------------------------
-- Perfiles (1 a 1 con auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_.]{3,24}$'),
  display_name text check (char_length(display_name) <= 50),
  bio text check (char_length(bio) <= 280),
  avatar_url text,
  -- perfil de belleza
  skin_type public.skin_type,
  sensitive_skin boolean not null default false,
  skin_tone text,               -- ej: 'muy claro', 'claro', 'medio', 'trigueño', 'oscuro', 'muy oscuro'
  undertone public.undertone,
  concerns text[] not null default '{}', -- ej: {'acne','manchas','poros'}
  onboarded boolean not null default false,
  -- verificación y rol: solo los cambia un admin
  is_verified boolean not null default false,
  verified_kind public.verified_kind,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- crea el perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------
create table public.categories (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  vertical public.vertical not null,
  parent_id bigint references public.categories (id),
  sort int not null default 0
);

create table public.brands (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  logo_url text,
  website text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id bigint not null references public.brands (id),
  category_id bigint not null references public.categories (id),
  name text not null,
  variant text,                 -- tono / tamaño, ej: '120 Ivory' o '30 ml'
  description text,
  image_url text,
  barcode text unique,
  ingredients text,             -- lista INCI tal cual
  launch_date date,
  status public.product_status not null default 'pendiente',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index products_brand_idx on public.products (brand_id);
create index products_category_idx on public.products (category_id);
create index products_name_trgm on public.products using gin (name extensions.gin_trgm_ops);
create index brands_name_trgm on public.brands using gin (name extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------
-- Reseñas
-- ---------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text check (char_length(title) <= 80),
  body text not null check (char_length(body) between 20 and 3000),
  would_repurchase boolean,
  disclosure public.disclosure not null default 'compra',
  -- foto del perfil de belleza al momento de reseñar (el perfil puede cambiar después)
  skin_type_snapshot public.skin_type,
  sensitive_snapshot boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_product_idx on public.reviews (product_id, created_at desc);
create index reviews_user_idx on public.reviews (user_id, created_at desc);

create function public.review_snapshot()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    select p.skin_type, p.sensitive_skin
      into new.skin_type_snapshot, new.sensitive_snapshot
      from public.profiles p where p.id = new.user_id;
  else
    new.skin_type_snapshot := old.skin_type_snapshot;
    new.sensitive_snapshot := old.sensitive_snapshot;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_snapshot
  before insert or update on public.reviews
  for each row execute function public.review_snapshot();

create table public.review_photos (
  id bigint generated always as identity primary key,
  review_id uuid not null references public.reviews (id) on delete cascade,
  path text not null,           -- ruta dentro del bucket 'review-photos'
  sort smallint not null default 0
);

-- votos de "me sirvió"
create table public.review_votes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

-- ---------------------------------------------------------------------
-- Social y listas
-- ---------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.list_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  kind public.list_kind not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id, kind)
);

-- ---------------------------------------------------------------------
-- Moderación
-- ---------------------------------------------------------------------
create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null check (char_length(reason) <= 500),
  status public.report_status not null default 'abierto',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Vistas y funciones de lectura
-- ---------------------------------------------------------------------
create view public.product_cards
with (security_invoker = true) as
select
  p.id, p.name, p.variant, p.image_url, p.launch_date, p.created_at, p.status,
  b.id as brand_id, b.name as brand_name,
  c.id as category_id, c.name as category_name, c.vertical,
  coalesce(round(avg(r.rating)::numeric, 1), 0) as avg_rating,
  count(r.id) as review_count
from public.products p
join public.brands b on b.id = p.brand_id
join public.categories c on c.id = p.category_id
left join public.reviews r on r.product_id = p.id
group by p.id, b.id, c.id;

create view public.review_feed
with (security_invoker = true) as
select
  r.*,
  pr.username, pr.display_name, pr.avatar_url, pr.is_verified, pr.verified_kind,
  (select count(*) from public.review_votes v where v.review_id = r.id) as helpful_count
from public.reviews r
join public.profiles pr on pr.id = r.user_id;

-- normaliza texto para buscar: sin tildes, sin mayúsculas, sin signos ("L'Oréal" -> "loreal")
create function public.normalize_search(t text)
returns text
language sql
stable
set search_path = public, extensions
as $$
  select regexp_replace(lower(unaccent(coalesce(t, ''))), '[^a-z0-9]', '', 'g');
$$;

-- búsqueda por nombre de producto, marca o categoría
create function public.search_products(q text)
returns setof public.product_cards
language sql
stable
set search_path = public, extensions
as $$
  select pc.*
  from public.product_cards pc
  where pc.status = 'aprobado'
    and char_length(normalize_search(q)) > 0
    and (
      normalize_search(pc.name) like '%' || normalize_search(q) || '%'
      or normalize_search(pc.brand_name) like '%' || normalize_search(q) || '%'
      or normalize_search(pc.brand_name || pc.name) like '%' || normalize_search(q) || '%'
      or normalize_search(pc.category_name) like '%' || normalize_search(q) || '%'
      or similarity(pc.name, q) > 0.3
    )
  order by greatest(similarity(pc.name, q), similarity(pc.brand_name, q)) desc,
           pc.review_count desc
  limit 50;
$$;

-- ---------------------------------------------------------------------
-- Seguridad (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.review_photos enable row level security;
alter table public.review_votes enable row level security;
alter table public.follows enable row level security;
alter table public.list_items enable row level security;
alter table public.reports enable row level security;

-- perfiles: todos pueden ver, cada quien edita el suyo
create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- nadie puede autoverificarse ni hacerse admin: solo estas columnas son editables desde la app.
-- La verificación y el rol admin se asignan desde el panel de Supabase (Table Editor).
revoke update on public.profiles from authenticated, anon;
grant update (username, display_name, bio, avatar_url, skin_type, sensitive_skin,
              skin_tone, undertone, concerns, onboarded)
  on public.profiles to authenticated;

-- catálogo: lectura libre, escritura admin
create policy "categorias visibles" on public.categories for select using (true);
create policy "admin categorias" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "marcas visibles" on public.brands for select using (true);
create policy "admin marcas" on public.brands for all using (public.is_admin()) with check (public.is_admin());

-- productos: se ven los aprobados; cualquiera logueado puede sugerir uno (queda pendiente)
create policy "productos visibles" on public.products for select
  using (status = 'aprobado' or created_by = auth.uid() or public.is_admin());
create policy "sugerir producto" on public.products for insert to authenticated
  with check (created_by = auth.uid() and status = 'pendiente');
create policy "admin productos" on public.products for update using (public.is_admin());
create policy "admin borra productos" on public.products for delete using (public.is_admin());

-- reseñas
create policy "resenas visibles" on public.reviews for select using (true);
create policy "crear mi resena" on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.products p where p.id = product_id and p.status = 'aprobado')
  );
create policy "editar mi resena" on public.reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "borrar mi resena" on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

create policy "fotos visibles" on public.review_photos for select using (true);
create policy "fotos de mi resena" on public.review_photos for all to authenticated
  using (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid()));

create policy "votos visibles" on public.review_votes for select using (true);
create policy "votar" on public.review_votes for insert to authenticated
  with check (
    user_id = auth.uid()
    and not exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
  );
create policy "quitar voto" on public.review_votes for delete using (user_id = auth.uid());

-- seguir
create policy "follows visibles" on public.follows for select using (true);
create policy "seguir" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "dejar de seguir" on public.follows for delete using (follower_id = auth.uid());

-- listas: privadas por ahora
create policy "mis listas" on public.list_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reportes: cualquiera reporta, solo admin los ve y gestiona
create policy "reportar" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "admin reportes" on public.reports for select using (public.is_admin());
create policy "admin gestiona reportes" on public.reports for update using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage (fotos)
-- Cada usuario sube dentro de una carpeta con su id: <user_id>/archivo.jpg
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('review-photos', 'review-photos', true),
       ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "subir a mi carpeta" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'review-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "actualizar mi carpeta" on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'review-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "borrar de mi carpeta" on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'review-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "admin imagenes de producto" on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
