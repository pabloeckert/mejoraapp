/**
 * Badge definitions — MejoraApp Gamificación
 *
 * Cada badge tiene un slug (coincide con DB), nombre, descripción, icono y color.
 * Los badges se otorgan automáticamente via triggers SQL.
 */

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    slug: "primer-post",
    name: "Primer Post",
    description: "Publicaste tu primer post en el muro",
    emoji: "✍️",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    slug: "5-posts",
    name: "5 Posts",
    description: "Publicaste 5 posts en el muro",
    emoji: "📝",
    color: "text-blue-700",
    bgColor: "bg-blue-600/10",
  },
  {
    slug: "10-posts",
    name: "10 Posts",
    description: "Publicaste 10 posts — sos parte activa de la comunidad",
    emoji: "🔥",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    slug: "primer-comentario",
    name: "Primer Comentario",
    description: "Dejaste tu primer comentario en el muro",
    emoji: "💬",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    slug: "primer-diagnostico",
    name: "Primer Diagnóstico",
    description: "Completaste tu primer diagnóstico estratégico",
    emoji: "🎯",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    slug: "5-diagnosticos",
    name: "5 Diagnósticos",
    description: "Completaste 5 diagnósticos — conocés tu negocio a fondo",
    emoji: "🧠",
    color: "text-purple-700",
    bgColor: "bg-purple-600/10",
  },
  {
    slug: "10-likes",
    name: "10 Likes",
    description: "Diste 10 likes — apoyás a la comunidad",
    emoji: "❤️",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    slug: "3-dias-activo",
    name: "3 Días Activo",
    description: "Participaste en 3 días distintos",
    emoji: "📅",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
];

export const getBadgeBySlug = (slug: string): BadgeDefinition | undefined =>
  BADGES.find((b) => b.slug === slug);

export const ALL_BADGE_SLUGS = BADGES.map((b) => b.slug);
