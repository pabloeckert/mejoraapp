/**
 * Repository Layer — Abstracción sobre Supabase
 *
 * Centraliza todas las llamadas a la base de datos.
 * Si se migra el backend, solo se reescribe este módulo.
 *
 * Uso:
 *   import { wallRepo, contentRepo, profileRepo } from "@/repositories";
 *   const posts = await wallRepo.getPosts(0, 20);
 *
 * NOTA: Los services/ ya encapsulan la lógica de negocio.
 * Los repositorios son la capa más baja (solo DB).
 * Para lógica de negocio, usar services/ en su lugar.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// ── Error Wrapper ──────────────────────────────────────────────
/** Wraps Supabase errors with context for easier debugging */
function throwIfError(
  error: { message: string; code?: string } | null,
  context: string
): void {
  if (error) {
    const msg = `[Repository:${context}] ${error.message}`;
    console.error(msg, error);
    throw new Error(msg);
  }
}

// ── Types ──────────────────────────────────────────────────────
type WallPost = Tables<"wall_posts">;
type WallComment = Tables<"wall_comments">;
type ContentPost = Tables<"content_posts">;
type Profile = Tables<"profiles">;
type Novedad = Tables<"novedades">;
type DiagnosticResult = Tables<"diagnostic_results">;

// ── Wall Repository ────────────────────────────────────────────
export const wallRepo = {
  async getPosts(page: number, limit: number = 20): Promise<WallPost[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .from("wall_posts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    throwIfError(error, "wallRepo.getPosts");
    return data ?? [];
  },

  async getComments(postId: string): Promise<WallComment[]> {
    const { data, error } = await supabase
      .from("wall_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    throwIfError(error, "wallRepo.getComments");
    return data ?? [];
  },

  async createPost(content: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    const { data, error } = await supabase
      .from("wall_posts")
      .insert({ content, user_id: user.id })
      .select("id")
      .single();
    throwIfError(error, "wallRepo.createPost");
    return data.id;
  },

  async createComment(postId: string, content: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    const { data, error } = await supabase
      .from("wall_comments")
      .insert({ post_id: postId, content, user_id: user.id })
      .select("id")
      .single();
    throwIfError(error, "wallRepo.createComment");
    return data.id;
  },

  async toggleLike(postId: string): Promise<"liked" | "unliked"> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    const { data: existing } = await supabase
      .from("wall_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      await supabase.from("wall_likes").delete().eq("id", existing.id);
      return "unliked";
    } else {
      await supabase.from("wall_likes").insert({ post_id: postId, user_id: user.id });
      return "liked";
    }
  },

  async deletePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    const { error } = await supabase
      .from("wall_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);
    throwIfError(error, "wallRepo.deletePost");
  },
};

// ── Content Repository ─────────────────────────────────────────
export const contentRepo = {
  async getPosts(category?: string): Promise<ContentPost[]> {
    let query = supabase
      .from("content_posts")
      .select("*, content_categories(nombre)")
      .eq("estado", "publicado")
      .order("created_at", { ascending: false });
    if (category) query = query.eq("categoria_id", category);
    const { data, error } = await query;
    throwIfError(error, "contentRepo.getPosts");
    return data ?? [];
  },

  async searchPosts(query: string): Promise<ContentPost[]> {
    const { data, error } = await supabase
      .from("content_posts")
      .select("*, content_categories(nombre)")
      .eq("estado", "publicado")
      .or(`titulo.ilike.%${query}%,resumen.ilike.%${query}%,contenido.ilike.%${query}%`)
      .order("created_at", { ascending: false });
    throwIfError(error, "contentRepo.searchPosts");
    return data ?? [];
  },
};

// ── Profile Repository ─────────────────────────────────────────
export const profileRepo = {
  async get(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    throwIfError(error, "profileRepo.get");
    return data;
  },

  async update(userId: string, updates: TablesUpdate<"profiles">): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);
    throwIfError(error, "profileRepo.update");
  },

  async isComplete(userId: string): Promise<boolean> {
    const profile = await this.get(userId);
    return !!(profile?.empresa || profile?.cargo);
  },
};

// ── Diagnostic Repository ──────────────────────────────────────
export const diagnosticRepo = {
  async getHistory(userId: string, limit: number = 3): Promise<DiagnosticResult[]> {
    const { data, error } = await supabase
      .from("diagnostic_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    throwIfError(error, "diagnosticRepo.getHistory");
    return data ?? [];
  },

  async save(result: TablesInsert<"diagnostic_results">): Promise<string> {
    const { data, error } = await supabase
      .from("diagnostic_results")
      .insert(result)
      .select("id")
      .single();
    throwIfError(error, "diagnosticRepo.save");
    return data.id;
  },
};

// ── Novedades Repository ───────────────────────────────────────
export const novedadesRepo = {
  async getAll(): Promise<Novedad[]> {
    const { data, error } = await supabase
      .from("novedades")
      .select("*")
      .order("fecha_publicacion", { ascending: false });
    throwIfError(error, "novedadesRepo.getAll");
    return data ?? [];
  },
};
