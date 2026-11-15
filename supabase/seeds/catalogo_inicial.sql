-- =====================================================================
-- Catálogo inicial: 18 marcas elegidas por Mei y ~115 productos.
-- Solo nombres de marca, producto y categoría (sin fotos ni textos de terceros).
-- Se puede correr más de una vez: no duplica marcas ni productos.
-- =====================================================================

-- Categoría nueva para aguas termales y brumas
insert into public.categories (slug, name, vertical, parent_id, sort)
select 'agua-termal', 'Agua termal y brumas', 'skincare', c.id, 3
from public.categories c where c.slug = 'tratamiento'
on conflict (slug) do nothing;

-- The Ordinary era solo de prueba y no está entre las marcas elegidas
delete from public.products p using public.brands b
where p.brand_id = b.id and b.slug = 'the-ordinary'
  and not exists (select 1 from public.reviews r where r.product_id = p.id);
delete from public.brands b
where b.slug = 'the-ordinary' and not exists (select 1 from public.products p where p.brand_id = b.id);

-- Marcas
insert into public.brands (slug, name) values
  ('maybelline', 'Maybelline'),
  ('loreal-paris', 'L''Oréal Paris'),
  ('rimmel', 'Rimmel'),
  ('revlon', 'Revlon'),
  ('cher', 'Cher'),
  ('extreme', 'Extreme'),
  ('get-the-look', 'Get the Look'),
  ('la-roche-posay', 'La Roche-Posay'),
  ('vichy', 'Vichy'),
  ('avene', 'Avène'),
  ('eucerin', 'Eucerin'),
  ('isdin', 'ISDIN'),
  ('caviahue', 'Caviahue'),
  ('cerave', 'CeraVe'),
  ('bioderma', 'Bioderma'),
  ('cetaphil', 'Cetaphil'),
  ('garnier', 'Garnier'),
  ('acf-by-dadatina', 'ACF by Dadatina')
on conflict (slug) do nothing;

-- Productos (aprobados). Se saltean los que ya existen con el mismo nombre y marca.
insert into public.products (brand_id, category_id, name, status)
select b.id, c.id, v.name, 'aprobado'
from (values
  -- Maybelline
  ('maybelline', 'base', 'Fit Me Matte + Poreless'),
  ('maybelline', 'base', 'Super Stay Active Wear 30H'),
  ('maybelline', 'corrector', 'Instant Age Rewind Eraser'),
  ('maybelline', 'corrector', 'Fit Me Concealer'),
  ('maybelline', 'polvo', 'Fit Me Matte + Poreless Polvo'),
  ('maybelline', 'mascara', 'Lash Sensational Sky High'),
  ('maybelline', 'mascara', 'The Colossal'),
  ('maybelline', 'mascara', 'Lash Sensational'),
  ('maybelline', 'labial', 'SuperStay Matte Ink'),
  ('maybelline', 'gloss', 'Lifter Gloss'),
  -- L'Oréal Paris
  ('loreal-paris', 'base', 'True Match'),
  ('loreal-paris', 'base', 'Infallible 24H Fresh Wear'),
  ('loreal-paris', 'corrector', 'True Match Concealer The One'),
  ('loreal-paris', 'polvo', 'Infallible 24H Fresh Wear Polvo'),
  ('loreal-paris', 'mascara', 'Telescopic'),
  ('loreal-paris', 'mascara', 'Lash Paradise'),
  ('loreal-paris', 'mascara', 'Voluminous Original'),
  ('loreal-paris', 'labial', 'Infallible Matte Resistance'),
  ('loreal-paris', 'serum', 'Revitalift Ácido Hialurónico Sérum'),
  -- Rimmel
  ('rimmel', 'base', 'Lasting Finish 25H'),
  ('rimmel', 'base', 'Match Perfection'),
  ('rimmel', 'corrector', 'Match Perfection Concealer'),
  ('rimmel', 'polvo', 'Stay Matte'),
  ('rimmel', 'mascara', 'Wonder''Extension'),
  ('rimmel', 'mascara', 'Scandaleyes'),
  ('rimmel', 'labial', 'Stay Matte Liquid Lip Colour'),
  -- Revlon
  ('revlon', 'base', 'ColorStay'),
  ('revlon', 'base', 'PhotoReady Candid'),
  ('revlon', 'corrector', 'ColorStay Concealer'),
  ('revlon', 'labial', 'Super Lustrous'),
  ('revlon', 'labial', 'ColorStay Satin Ink'),
  ('revlon', 'delineador', 'ColorStay Skinny Liquid Liner'),
  -- Cher
  ('cher', 'labial', 'Satin Kiss Lipstick'),
  ('cher', 'labial', 'Stick To The Gloss'),
  ('cher', 'gloss', 'Nectar Lip Oil'),
  ('cher', 'gloss', 'Peptide Lip Balm'),
  ('cher', 'gloss', 'Lip Gloss Voluminizador Hialurónico'),
  ('cher', 'mascara', 'XXL Big Lashes II'),
  -- Extreme
  ('extreme', 'base', 'CC Cream'),
  ('extreme', 'base', 'Natural Skin'),
  ('extreme', 'mascara', 'Ultrabomb Extra'),
  ('extreme', 'mascara', 'Universal Voluminizing'),
  ('extreme', 'labial', 'Duo Lacquer'),
  ('extreme', 'labial', 'Keep It Creamy'),
  ('extreme', 'rubor', 'Lip and Cheek'),
  ('extreme', 'gloss', 'Glossy Gloss'),
  -- Get the Look
  ('get-the-look', 'base', 'Even Skin'),
  ('get-the-look', 'base', 'Pro Serum Foundation'),
  ('get-the-look', 'corrector', 'Corrector Fresh con Ácido Hialurónico'),
  ('get-the-look', 'corrector', 'Bright Concealer'),
  ('get-the-look', 'labial', 'Ultra Shine'),
  ('get-the-look', 'labial', 'Ultra Matte'),
  ('get-the-look', 'labial', 'Creamy Lips con Ácido Hialurónico'),
  ('get-the-look', 'rubor', 'Matte Liquid Blush con Ácido Hialurónico'),
  -- La Roche-Posay
  ('la-roche-posay', 'limpiador', 'Effaclar Gel Purificante'),
  ('la-roche-posay', 'crema', 'Effaclar Duo+M'),
  ('la-roche-posay', 'crema', 'Cicaplast Baume B5+'),
  ('la-roche-posay', 'serum', 'Hyalu B5 Sérum'),
  ('la-roche-posay', 'serum', 'Pure Vitamin C10'),
  ('la-roche-posay', 'serum', 'Mela B3 Sérum'),
  ('la-roche-posay', 'desmaquillante', 'Agua Micelar Ultra'),
  ('la-roche-posay', 'protector', 'Anthelios UVmune 400 Fluido'),
  ('la-roche-posay', 'protector', 'Anthelios Oil Control Fluido'),
  -- Vichy
  ('vichy', 'serum', 'Mineral 89'),
  ('vichy', 'crema', 'Liftactiv Collagen Specialist'),
  ('vichy', 'limpiador', 'Normaderm Gel Limpiador'),
  ('vichy', 'protector', 'Capital Soleil UV-Age Daily'),
  -- Avène
  ('avene', 'agua-termal', 'Agua Termal Spray'),
  ('avene', 'crema', 'Cicalfate+ Crema Reparadora'),
  ('avene', 'limpiador', 'Cleanance Gel Limpiador'),
  ('avene', 'crema', 'Hydrance'),
  ('avene', 'protector', 'Fluido Muy Alta Protección FPS50+'),
  -- Eucerin
  ('eucerin', 'crema', 'Hyaluron-Filler Crema de Día'),
  ('eucerin', 'serum', 'Anti-Pigment Sérum Dual'),
  ('eucerin', 'serum', 'DermoPure Sérum Triple Efecto'),
  ('eucerin', 'limpiador', 'DermoPure Gel Limpiador'),
  ('eucerin', 'protector', 'Sun Oil Control FPS50+'),
  -- ISDIN
  ('isdin', 'protector', 'Fusion Water Magic'),
  ('isdin', 'protector', 'Eryfotona Actinica'),
  ('isdin', 'serum', 'Isdinceutics Flavo-C'),
  ('isdin', 'serum', 'Isdinceutics Hyaluronic Concentrate'),
  ('isdin', 'limpiador', 'Acniben Gel Limpiador'),
  -- Caviahue
  ('caviahue', 'crema', 'Crema Antiage Día'),
  ('caviahue', 'crema', 'Crema Antiage Noche'),
  ('caviahue', 'crema', 'Gel Hidratante Facial Hidratermal'),
  ('caviahue', 'crema', 'Cicancalm Crema'),
  ('caviahue', 'agua-termal', 'Agua Termal Volcánica Spray'),
  ('caviahue', 'limpiador', 'Clásica Leche de Limpieza Facial'),
  ('caviahue', 'desmaquillante', 'Agua Micelar'),
  ('caviahue', 'contorno', 'Clásica Crema Contorno de Ojos'),
  ('caviahue', 'serum', 'Serum C'),
  ('caviahue', 'protector', 'Protector Solar Facial Care FPS50'),
  -- CeraVe
  ('cerave', 'limpiador', 'Limpiador Espumoso'),
  ('cerave', 'limpiador', 'Limpiador Hidratante'),
  ('cerave', 'limpiador', 'Limpiador SA Renovador'),
  ('cerave', 'crema', 'Crema Hidratante'),
  ('cerave', 'crema', 'Loción Hidratante Facial PM'),
  ('cerave', 'contorno', 'Contorno de Ojos Reparador'),
  ('cerave', 'serum', 'Sérum Retinol Resurfacing'),
  -- Bioderma
  ('bioderma', 'desmaquillante', 'Sensibio H2O'),
  ('bioderma', 'limpiador', 'Sébium Gel Moussant'),
  ('bioderma', 'crema', 'Sensibio Defensive'),
  ('bioderma', 'serum', 'Hydrabio Sérum'),
  -- Cetaphil
  ('cetaphil', 'limpiador', 'Loción Limpiadora Suave'),
  ('cetaphil', 'limpiador', 'DermaControl Espuma Limpiadora'),
  ('cetaphil', 'crema', 'Crema Humectante'),
  ('cetaphil', 'crema', 'Loción Humectante'),
  -- Garnier
  ('garnier', 'desmaquillante', 'Agua Micelar Todo en 1'),
  ('garnier', 'serum', 'Express Aclara Sérum Vitamina C'),
  ('garnier', 'limpiador', 'Express Aclara Gel Limpiador'),
  ('garnier', 'crema', 'Skin Active Hyaluronic Aloe Gel'),
  -- ACF by Dadatina
  ('acf-by-dadatina', 'serum', 'Serum Vol. 1 Balance'),
  ('acf-by-dadatina', 'serum', 'Serum Vol. 2 Restauración'),
  ('acf-by-dadatina', 'serum', 'Serum Vol. 3 Renovación'),
  ('acf-by-dadatina', 'serum', 'SOS Ácido Azelaico 10%'),
  ('acf-by-dadatina', 'crema', 'Defensa AM/PM Crema Facial'),
  ('acf-by-dadatina', 'contorno', 'Energía Contorno de Ojos'),
  ('acf-by-dadatina', 'limpiador', 'Gel de Limpieza'),
  ('acf-by-dadatina', 'desmaquillante', 'Aceite Limpiador'),
  ('acf-by-dadatina', 'exfoliante', 'Tónico Exfoliante BHA 2%'),
  ('acf-by-dadatina', 'protector', 'Camuflaje UV Fotoprotector Toque Seco')
) as v(brand_slug, cat_slug, name)
join public.brands b on b.slug = v.brand_slug
join public.categories c on c.slug = v.cat_slug
where not exists (
  select 1 from public.products p where p.brand_id = b.id and p.name = v.name
);
