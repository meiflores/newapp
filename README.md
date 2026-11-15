# Fana (nombre provisorio)

App de reseñas de makeup y skincare. Cada persona arma su perfil de belleza (tipo de piel, tono, subtono, preocupaciones) y puede filtrar reseñas de gente con piel parecida a la suya.

**Stack:** React Native + Expo (SDK 58, Expo Router) · Supabase (login, base de datos Postgres, fotos) · TypeScript.
Un solo código para Android y, más adelante, iOS.

## Qué hay hoy

- Registro e inicio de sesión con mail y contraseña, recuperar contraseña.
- Perfil de belleza al primer ingreso (editable después).
- Inicio con "Últimos lanzamientos" y "Lo más reseñado".
- Búsqueda por producto, marca o categoría (ignora tildes, mayúsculas y signos: "loreal" encuentra "L'Oréal").
- Página de producto con promedio, descripción, ingredientes, botón "Quiero probarlo" y filtro "piel como la mía".
- Escribir, editar y borrar tu reseña: estrellas, texto, si lo recomprarías y cómo lo conseguiste (compra / regalo / publi).
- Votar reseñas como "Me sirvió".
- Perfil con foto, datos de belleza, tilde de verificada y tus reseñas.

La base ya tiene lugar para lo que viene: listas (rutina, terminados), seguir gente, reportes, sugerir productos y la categoría `tools` para beauty tools.

## Cómo levantarla

### 1. Supabase

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, corré en orden los archivos de `supabase/migrations/` y después `supabase/seed.sql` (categorías y unos productos de prueba). *(Ya está hecho en el proyecto `fana`.)*
3. Para probar más rápido: en **Authentication > Sign In / Providers > Email**, desactivá **Confirm email**. (Volver a activarlo antes de publicar.)
4. En **Project Settings > API Keys** copiá la URL del proyecto y la *publishable key*.

### 2. App

```bash
cp .env.example .env      # y completá las dos variables con lo del paso 4
npm install
npx expo start
```

Instalá **Expo Go** en tu Android y escaneá el QR que aparece en la terminal.

### 3. Hacerte admin o verificar una cuenta

Desde la app nadie puede autoverificarse ni hacerse admin (lo bloquea la base). Se hace en Supabase: **Table Editor > profiles**, buscá la fila y cambiá `role` a `admin`, o `is_verified` a `true` y elegí `verified_kind` (`creadora`, `profesional` o `marca`).

### 4. Cargar productos

Por ahora desde **Table Editor**: primero la marca en `brands`, después el producto en `products` con `status = aprobado`. Las imágenes van al bucket `product-images` en **Storage** (copiá la URL pública en `image_url`). Más adelante esto se hace desde un panel admin.

## Generar el APK para Android

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

EAS arma el APK en la nube y te da un link para instalarlo. Para subir a Google Play se usa el perfil `production` (genera un `.aab`) y `eas submit`.

## Estructura

```
src/
  app/                 pantallas (cada archivo es una ruta)
    (tabs)/            Inicio, Buscar, Perfil
    producto/[id].tsx  página de producto
    resena/[productId].tsx  escribir/editar reseña
    perfil-belleza.tsx onboarding y edición del perfil
    login.tsx, registro.tsx
  components/          piezas reutilizables (botones, tarjetas, reseñas)
  lib/                 cliente de Supabase, tipos y opciones de belleza
  providers/           sesión y perfil de la usuaria
supabase/
  migrations/          esquema de la base (tablas, seguridad, búsqueda)
  seed.sql             datos iniciales
```

## Cambiar el nombre

Cuando esté definido: `APP_NAME` en `src/constants/theme.ts`, y `name`, `slug`, `scheme`, `android.package` e `ios.bundleIdentifier` en `app.json`. El `package` de Android no se puede cambiar después de publicar en Google Play, así que conviene definirlo antes.

## Comandos útiles

```bash
npm run typecheck   # revisa tipos
npx expo lint       # revisa estilo y errores comunes
```
