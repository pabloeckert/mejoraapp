/**
 * Content Service — Business logic for Contenido de Valor
 *
 * Centraliza: fetch, search, filter, recomendaciones.
 * Los componentes solo renderizan; la lógica vive aquí.
 */

import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export interface ContentPost {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  tipo_media: string;
  url_media: string;
  categoria_id: string;
  estado: string;
  imagen_url: string;
  fecha_programada: string | null;
  created_at: string;
  content_categories?: { nombre: string } | null;
}

export interface ContentCategory {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
}

// ── Fetch Operations ───────────────────────────────────────────
export async function fetchContentPosts(category?: string): Promise<ContentPost[]> {
  let query = supabase
    .from("content_posts")
    .select("*, content_categories(nombre)")
    .eq("estado", "publicado")
    .order("created_at", { ascending: false });
  if (category) query = query.eq("categoria_id", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ContentPost[]) ?? [];
}

export async function searchContentPosts(query: string): Promise<ContentPost[]> {
  const { data, error } = await supabase
    .from("content_posts")
    .select("*, content_categories(nombre)")
    .eq("estado", "publicado")
    .or(`titulo.ilike.%${query}%,resumen.ilike.%${query}%,contenido.ilike.%${query}%`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ContentPost[]) ?? [];
}

export async function fetchContentCategories(): Promise<ContentCategory[]> {
  const { data, error } = await supabase
    .from("content_categories")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return (data as ContentCategory[]) ?? [];
}

export async function fetchRecommendedContent(
  perfil: string,
  limit: number = 3
): Promise<ContentPost[]> {
  // Rule-based recommendations by profile
  const categoryMap: Record<string, string[]> = {
    crecimiento: ["estrategia", "ventas"],
    eficiencia: ["operaciones", "procesos"],
    innovacion: ["tecnologia", "marketing"],
    liderazgo: ["management", "equipo"],
  };

  const categories = categoryMap[perfil] ?? [];

  let query = supabase
    .from("content_posts")
    .select("*, content_categories(nombre)")
    .eq("estado", "publicado")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (categories.length > 0) {
    query = query.in("content_categories.nombre", categories);
  }

  const { data, error } = await query;
  if (error) {
    // Fallback: return latest posts
    const { data: fallback } = await supabase
      .from("content_posts")
      .select("*, content_categories(nombre)")
      .eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (fallback as ContentPost[]) ?? [];
  }
  return (data as ContentPost[]) ?? [];
}

// ── Media Type Helpers ─────────────────────────────────────────
export const MEDIA_TYPES = {
  articulo: { label: "Artículo", icon: "FileText" },
  video: { label: "Video", icon: "Play" },
  infografia: { label: "Infografía", icon: "Image" },
  pdf: { label: "PDF", icon: "Download" },
} as const;

export type MediaType = keyof typeof MEDIA_TYPES;

export function getMediaTypeLabel(tipo: string): string {
  return MEDIA_TYPES[tipo as MediaType]?.label ?? tipo;
}

// ── Category Filter Helpers ────────────────────────────────────
export function filterByCategory(posts: ContentPost[], categoryId: string | null): ContentPost[] {
  if (!categoryId) return posts;
  return posts.filter((p) => p.categoria_id === categoryId);
}

export function filterByMediaType(posts: ContentPost[], mediaType: string | null): ContentPost[] {
  if (!mediaType) return posts;
  return posts.filter((p) => p.tipo_media === mediaType);
}
