// Tipos que reflejan las tablas/vistas de supabase/migrations/0001_init.sql

export type SkinType = 'seca' | 'grasa' | 'mixta' | 'normal';
export type Undertone = 'frio' | 'calido' | 'neutro' | 'oliva';
export type Disclosure = 'compra' | 'regalo' | 'publi';
export type VerifiedKind = 'creadora' | 'profesional' | 'marca';
export type Vertical = 'makeup' | 'skincare' | 'tools';

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  skin_type: SkinType | null;
  sensitive_skin: boolean;
  skin_tone: string | null;
  undertone: Undertone | null;
  concerns: string[];
  onboarded: boolean;
  is_verified: boolean;
  verified_kind: VerifiedKind | null;
  role: 'user' | 'admin';
};

export type ProductCard = {
  id: string;
  name: string;
  variant: string | null;
  image_url: string | null;
  launch_date: string | null;
  brand_id: number;
  brand_name: string;
  category_id: number;
  category_name: string;
  vertical: Vertical;
  avg_rating: number | string;
  review_count: number;
};

export type ProductDetail = {
  id: string;
  description: string | null;
  ingredients: string | null;
};

export type FeedReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  would_repurchase: boolean | null;
  disclosure: Disclosure;
  skin_type_snapshot: SkinType | null;
  sensitive_snapshot: boolean | null;
  created_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  verified_kind: VerifiedKind | null;
  helpful_count: number;
};
