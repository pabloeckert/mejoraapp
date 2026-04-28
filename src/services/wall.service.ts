/**
 * Wall Service — Business logic for Muro Anónimo
 *
 * Centraliza: publicación, moderación, likes, comentarios, realtime.
 * Los componentes solo renderizan; la lógica vive aquí.
 */

import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export interface WallPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  status: string;
}

export interface WallComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  status: string;
}

export interface ModerationResult {
  success?: boolean;
  rejected?: boolean;
  reason?: string;
}

// ── Constants ──────────────────────────────────────────────────
export const MAX_POST_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 300;
export const POSTS_PER_PAGE = 20;

// ── Post Operations ────────────────────────────────────────────
export async function fetchWallPosts(page: number): Promise<WallPost[]> {
  const from = page * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const { data, error } = await supabase
    .from("wall_posts")
    .select("id, content, likes_count, comments_count, created_at, user_id, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return (data as WallPost[]) ?? [];
}

export async function publishPost(content: string): Promise<ModerationResult> {
  const { data, error } = await supabase.functions.invoke("moderate-post", {
    body: { content },
  });
  if (error) throw error;
  return data as ModerationResult;
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("wall_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

export function sendNewPostPushNotification(excludeUserId: string): void {
  supabase.functions
    .invoke("send-push-notification", {
      body: { action: "new_post", exclude_user_id: excludeUserId },
    })
    .catch(() => {}); // Fire-and-forget
}

// ── Comment Operations ─────────────────────────────────────────
export async function fetchComments(postId: string): Promise<WallComment[]> {
  const { data, error } = await supabase
    .from("wall_comments")
    .select("id, post_id, content, created_at, user_id, status")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as WallComment[]) ?? [];
}

export async function publishComment(postId: string, content: string): Promise<ModerationResult> {
  const { data, error } = await supabase.functions.invoke("moderate-comment", {
    body: { post_id: postId, content },
  });
  if (error) throw error;
  return data as ModerationResult;
}

// ── Like Operations ────────────────────────────────────────────
export async function toggleLike(
  postId: string,
  userId: string
): Promise<"liked" | "unliked"> {
  const { data: existing } = await supabase
    .from("wall_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wall_likes").delete().eq("id", existing.id);
    return "unliked";
  } else {
    await supabase.from("wall_likes").insert({ post_id: postId, user_id: userId });
    return "liked";
  }
}

// ── Realtime ───────────────────────────────────────────────────
export function createWallChannel(
  userId: string | undefined,
  onNewPost: () => void,
  onNewComment: (comment: WallComment) => void
) {
  const channelName = `wall_realtime_${userId ?? "anon"}`;

  // Remove stale channel
  const existing = supabase.getChannels().find((c) => c.topic === channelName);
  if (existing) supabase.removeChannel(existing);

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "wall_posts", filter: "status=eq.approved" },
      onNewPost
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "wall_comments", filter: "status=eq.approved" },
      (payload) => onNewComment(payload.new as WallComment)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ── Report ─────────────────────────────────────────────────────
export async function reportPost(
  postId: string,
  reason: string,
  userId: string
): Promise<void> {
  // Uses admin-action with moderate-post action to flag for review
  const { error } = await supabase.functions.invoke("admin-action", {
    body: { action: "moderate-post", postId, status: "flagged" },
  });
  if (error) throw error;
}

// ── Time Formatting ────────────────────────────────────────────
export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function formatFullDate(date: string): string {
  return new Date(date).toLocaleString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
