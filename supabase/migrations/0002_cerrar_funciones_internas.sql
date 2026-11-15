-- Ajuste sugerido por el chequeo de seguridad de Supabase:
-- las funciones de trigger no tienen que poder llamarse por la API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.review_snapshot() from public, anon, authenticated;

-- is_admin la usan las políticas de seguridad: se mueve a un schema que la API no expone
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
