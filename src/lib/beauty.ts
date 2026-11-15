import type { Disclosure, SkinType, Undertone, VerifiedKind } from './types';

export const SKIN_TYPES: { value: SkinType; label: string }[] = [
  { value: 'seca', label: 'Seca' },
  { value: 'grasa', label: 'Grasa' },
  { value: 'mixta', label: 'Mixta' },
  { value: 'normal', label: 'Normal' },
];

export const SKIN_TONES = ['Muy claro', 'Claro', 'Medio', 'Trigueño', 'Oscuro', 'Muy oscuro'];

export const UNDERTONES: { value: Undertone; label: string }[] = [
  { value: 'frio', label: 'Frío' },
  { value: 'calido', label: 'Cálido' },
  { value: 'neutro', label: 'Neutro' },
  { value: 'oliva', label: 'Oliva' },
];

export const CONCERNS: { value: string; label: string }[] = [
  { value: 'acne', label: 'Acné' },
  { value: 'manchas', label: 'Manchas' },
  { value: 'poros', label: 'Poros' },
  { value: 'brillo', label: 'Brillo' },
  { value: 'rojeces', label: 'Rojeces' },
  { value: 'deshidratacion', label: 'Deshidratación' },
  { value: 'lineas', label: 'Líneas de expresión' },
  { value: 'ojeras', label: 'Ojeras' },
];

export const DISCLOSURES: { value: Disclosure; label: string; badge: string }[] = [
  { value: 'compra', label: 'Lo compré yo', badge: 'Compra propia' },
  { value: 'regalo', label: 'Me lo regalaron / enviaron', badge: 'Regalo' },
  { value: 'publi', label: 'Es una colaboración paga', badge: 'Publi' },
];

export const VERIFIED_LABEL: Record<VerifiedKind, string> = {
  creadora: 'Creadora verificada',
  profesional: 'Profesional verificada',
  marca: 'Marca oficial',
};

export const skinLabel = (v: SkinType | null) => SKIN_TYPES.find((s) => s.value === v)?.label;
export const undertoneLabel = (v: Undertone | null) => UNDERTONES.find((s) => s.value === v)?.label;
export const concernLabel = (v: string) => CONCERNS.find((c) => c.value === v)?.label ?? v;
export const disclosureBadge = (v: Disclosure) => DISCLOSURES.find((d) => d.value === v)?.badge;
