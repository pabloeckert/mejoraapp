/** Shared types for Muro components */

export type PostType = "consulta" | "caso" | "convocatoria";

export interface WallPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  status: string;
  post_type: PostType;
}

export const POST_TYPE_CONFIG: Record<PostType, { label: string; emoji: string; color: string; bgColor: string }> = {
  consulta: {
    label: "Consulta",
    emoji: "❓",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  caso: {
    label: "Caso",
    emoji: "📋",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  convocatoria: {
    label: "Convocatoria",
    emoji: "📢",
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
};
