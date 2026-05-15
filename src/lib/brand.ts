export const brand = {
  black:       '#0D0D0D',
  white:       '#FFFFFF',
  red:         '#D9072D',
  navy:        '#020659',
  blue:        '#1C4D8C',
  yellow:      '#F2BB16',
  surface:     '#111118',
  surfaceAlt:  '#1A1A26',
  border:      '#2A2A3A',
  borderHover: '#3A3A4A',
} as const;

export type MembershipLevel = 'n0' | 'n1' | 'n2' | 'admin';

export const MEMBERSHIP_CONFIG = {
  n0: {
    label: 'Free', color: '#6B7280', border: '#374151',
    priceARS: null, priceUSD: null,
    cta: 'Crear cuenta gratis',
    tagline: 'Explorá la comunidad',
    benefits: ['Acceso a contenido de valor', 'Diagnóstico estratégico gratuito', 'Vista del muro de la comunidad'],
  },
  n1: {
    label: 'Miembro', color: '#1C4D8C', border: '#1C4D8C',
    priceARS: 50000, priceUSD: 20,
    cta: 'Ser Miembro',
    tagline: 'Tu comunidad te espera',
    benefits: ['Muro completo: publicá consultas y casos', 'Comunidad de profesionales y emprendedores', 'Acceso a eventos on demand', 'Directorio de miembros', 'Contenido exclusivo de la comunidad'],
  },
  n2: {
    label: 'Círculo Dorado', color: '#F2BB16', border: '#F2BB16',
    priceARS: 150000, priceUSD: 100,
    cta: 'Acceder al Círculo',
    tagline: 'La red de C-Level que mueve empresas',
    benefits: ['Red privada de CEOs y Directores', 'Mesa de Alianzas: conectate con decisores', 'Botón de Emergencia: asesoría urgente directa', 'Eventos exclusivos de alto nivel', 'Todo lo de Miembro incluido'],
  },
} as const;
