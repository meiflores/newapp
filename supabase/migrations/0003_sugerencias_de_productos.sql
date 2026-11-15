-- Sugerencias de productos que todavía no están en la app.
-- Las usuarias no pueden crear marcas ni productos aprobados: dejan una sugerencia
-- y una admin la revisa y carga el producto (Table Editor o, más adelante, el panel admin).

create type public.suggestion_status as enum ('pendiente', 'cargado', 'descartado');

create table public.product_suggestions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  brand_name text not null check (char_length(brand_name) between 1 and 80),
  product_name text not null check (char_length(product_name) between 2 and 120),
  variant text check (char_length(variant) <= 80),
  category_id bigint references public.categories (id),
  notes text check (char_length(notes) <= 500),
  status public.suggestion_status not null default 'pendiente',
  created_at timestamptz not null default now()
);

create index product_suggestions_status_idx on public.product_suggestions (status, created_at desc);

alter table public.product_suggestions enable row level security;

create policy "sugerir" on public.product_suggestions for insert to authenticated
  with check (user_id = auth.uid() and status = 'pendiente');
create policy "ver mis sugerencias" on public.product_suggestions for select to authenticated
  using (user_id = auth.uid() or private.is_admin());
create policy "admin gestiona sugerencias" on public.product_suggestions for update to authenticated
  using (private.is_admin());
