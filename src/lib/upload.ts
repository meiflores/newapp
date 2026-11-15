import { supabase } from './supabase';

type Bucket = 'avatars' | 'review-photos';

/** Sube una imagen local (uri del selector de fotos) y devuelve la ruta dentro del bucket */
export async function uploadImage(bucket: Bucket, path: string, uri: string, mimeType?: string | null) {
  const bytes = await fetch(uri).then((r) => r.arrayBuffer());
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType: mimeType ?? 'image/jpeg' });
  if (error) throw error;
  return path;
}

export function extensionFor(mimeType?: string | null) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/heic') return 'heic';
  return 'jpg';
}
