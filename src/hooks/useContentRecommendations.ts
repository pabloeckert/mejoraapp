/**
 * useContentRecommendations — Recomienda contenido basado en perfil de diagnóstico
 *
 * Mapea cada perfil a categorías y temas relevantes.
 * Retorna los posts más relevantes para el perfil del usuario.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"content_posts"> & {
  content_categories?: { nombre: string; slug: string } | null;
};

// Perfil → categorías recomendadas
const PROFILE_CATEGORY_MAP: Record<string, string[]> = {
  SATURADO: ["estrategia", "tip"],
  INVISIBLE: ["estrategia", "tip"],
  LIDER_SOLO: ["estrategia", "reflexion"],
  DESCONECTADO: ["estrategia", "reflexion"],
  ESTANCADO: ["estrategia", "tip"],
  NUEVA_GEN: ["tip", "estrategia"],
  EQUIPO_DESALINEADO: ["estrategia", "reflexion"],
  VENDEDOR_SIN_RESULTADOS: ["tip", "estrategia"],
};

// Perfil → keywords para buscar en título/resumen
const PROFILE_KEYWORDS: Record<string, string[]> = {
  SATURADO: ["sistema", "proceso", "delegar", "organización", "tiempo", "estructura"],
  INVISIBLE: ["ventas", "precio", "propuesta", "valor", "cliente", "diferenciación", "marca"],
  LIDER_SOLO: ["equipo", "delegar", "líder", "liderazgo", "gestión", "personas"],
  DESCONECTADO: ["estrategia", "visión", "plan", "objetivo", "futuro", "decisión"],
  ESTANCADO: ["crecimiento", "escalar", "innovación", "cambio", "mercado", "oportunidad"],
  NUEVA_GEN: ["sistema", "estructura", "base", "fundamento", "organización", "proceso"],
  EQUIPO_DESALINEADO: ["equipo", "comunicación", "reunión", "rol", "objetivo", "alineación"],
  VENDEDOR_SIN_RESULTADOS: ["ventas", "proceso", "cliente", "pipeline", "seguimiento", "cierre"],
};

export function useContentRecommendations(
  perfil: string | null,
  limit: number = 3
) {
  const [recommendations, setRecommendations] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!perfil) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      const categories = PROFILE_CATEGORY_MAP[perfil] || ["estrategia"];
      const keywords = PROFILE_KEYWORDS[perfil] || [];

      // Fetch by category first
      const { data: byCategory } = await supabase
        .from("content_posts")
        .select("*, content_categories(nombre, slug)")
        .eq("estado", "publicado")
        .in(
          "category_id",
          // We need to get category IDs, but let's use a simpler approach
          // Fetch all published and filter client-side
          (await supabase.from("content_categories").select("id, slug")).data
            ?.filter((c) => categories.includes(c.slug))
            .map((c) => c.id) ?? []
        )
        .order("published_at", { ascending: false })
        .limit(limit * 2);

      let results: Post[] = (byCategory as Post[]) ?? [];

      // If not enough, search by keywords in title/resumen
      if (results.length < limit && keywords.length > 0) {
        const keywordQuery = keywords.slice(0, 3).join("|");
        const { data: byKeyword } = await supabase
          .from("content_posts")
          .select("*, content_categories(nombre, slug)")
          .eq("estado", "publicado")
          .or(`titulo.ilike.%${keywords[0]}%,resumen.ilike.%${keywords[0]}%`)
          .order("published_at", { ascending: false })
          .limit(limit);

        const existing = new Set(results.map((r) => r.id));
        const newPosts = ((byKeyword as Post[]) ?? []).filter(
          (p) => !existing.has(p.id)
        );
        results = [...results, ...newPosts];
      }

      setRecommendations(results.slice(0, limit));
      setLoading(false);
    };

    fetchRecommendations();
  }, [perfil, limit]);

  return { recommendations, loading };
}
