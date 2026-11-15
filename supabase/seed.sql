-- =====================================================================
-- Datos iniciales: categorías + algunas marcas/productos de prueba.
-- Correr después de 0001_init.sql. Los productos son solo para probar la app;
-- se pueden borrar o editar desde el Table Editor de Supabase.
-- =====================================================================

-- Categorías principales
insert into public.categories (slug, name, vertical, sort) values
  ('rostro',        'Rostro',            'makeup', 1),
  ('ojos',          'Ojos',              'makeup', 2),
  ('labios',        'Labios',            'makeup', 3),
  ('limpieza',      'Limpieza',          'skincare', 1),
  ('tratamiento',   'Tratamiento',       'skincare', 2),
  ('hidratacion',   'Hidratación',       'skincare', 3),
  ('proteccion',    'Protección solar',  'skincare', 4);

-- Subcategorías
insert into public.categories (slug, name, vertical, parent_id, sort)
select v.slug, v.name, v.vertical::public.vertical, c.id, v.sort
from (values
  ('base',          'Base',              'makeup',   'rostro', 1),
  ('corrector',     'Corrector',         'makeup',   'rostro', 2),
  ('rubor',         'Rubor',             'makeup',   'rostro', 3),
  ('polvo',         'Polvo',             'makeup',   'rostro', 4),
  ('mascara',       'Máscara de pestañas','makeup',  'ojos',   1),
  ('sombras',       'Sombras',           'makeup',   'ojos',   2),
  ('delineador',    'Delineador',        'makeup',   'ojos',   3),
  ('labial',        'Labial',            'makeup',   'labios', 1),
  ('gloss',         'Gloss',             'makeup',   'labios', 2),
  ('limpiador',     'Limpiador',         'skincare', 'limpieza', 1),
  ('desmaquillante','Desmaquillante',    'skincare', 'limpieza', 2),
  ('serum',         'Sérum',             'skincare', 'tratamiento', 1),
  ('exfoliante',    'Exfoliante',        'skincare', 'tratamiento', 2),
  ('crema',         'Crema hidratante',  'skincare', 'hidratacion', 1),
  ('contorno',      'Contorno de ojos',  'skincare', 'hidratacion', 2),
  ('protector',     'Protector solar',   'skincare', 'proteccion', 1)
) as v(slug, name, vertical, parent_slug, sort)
join public.categories c on c.slug = v.parent_slug;

-- Marcas de prueba
insert into public.brands (slug, name) values
  ('maybelline', 'Maybelline'),
  ('la-roche-posay', 'La Roche-Posay'),
  ('the-ordinary', 'The Ordinary'),
  ('cerave', 'CeraVe'),
  ('loreal-paris', 'L''Oréal Paris');

-- Productos de prueba (aprobados)
insert into public.products (brand_id, category_id, name, variant, description, status, launch_date)
select b.id, c.id, v.name, v.variant, v.description, 'aprobado', v.launch::date
from (values
  ('maybelline',     'base',      'Fit Me Matte + Poreless', '120 Classic Ivory', 'Base de acabado mate para piel normal a grasa.', '2026-01-10'),
  ('maybelline',     'mascara',   'Lash Sensational Sky High', null, 'Máscara de pestañas para largo y volumen.', '2025-09-01'),
  ('la-roche-posay', 'protector', 'Anthelios UVmune 400 Fluido', 'FPS 50+ 50 ml', 'Protector solar fluido de textura liviana.', '2026-10-20'),
  ('the-ordinary',   'serum',     'Niacinamide 10% + Zinc 1%', '30 ml', 'Sérum para poros y control de brillo.', '2025-06-15'),
  ('cerave',         'limpiador', 'Limpiador Espumoso', '236 ml', 'Limpiador en gel para piel normal a grasa.', '2025-03-01'),
  ('cerave',         'crema',     'Crema Hidratante', '340 g', 'Crema con ceramidas para piel seca.', '2025-03-01'),
  ('loreal-paris',   'labial',    'Infallible Matte Resistance', '420 Le Rouge Paris', 'Labial líquido mate de larga duración.', '2026-11-01')
) as v(brand_slug, cat_slug, name, variant, description, launch)
join public.brands b on b.slug = v.brand_slug
join public.categories c on c.slug = v.cat_slug;
