/**
 * useWallInteractions — Hook centralizado para interacciones del muro
 *
 * Centraliza: likes, comentarios, posts expandidos, confirmación de delete.
 * Reduce los useState dispersos en Muro.tsx.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackLikePost, trackCommentPost, trackDeletePost } from "@/lib/analytics";

export interface WallComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  status: string;
}

interface WallInteractionsState {
  likedPosts: Set<string>;
  expandedPosts: Set<string>;
  commentsMap: Record<string, WallComment[]>;
  loadingComments: Set<string>;
  commentTexts: Record<string, string>;
  submittingComment: Set<string>;
  confirmingDelete: string | null;
}

export function useWallInteractions(userId: string | undefined) {
  const { toast } = useToast();

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, WallComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  // Load user likes on mount
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("wall_likes")
      .select("post_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        setLikedPosts(new Set((data ?? []).map((l) => l.post_id)));
      });
  }, [userId]);

  const toggleExpand = useCallback(
    async (postId: string) => {
      setExpandedPosts((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });

      if (!expandedPosts.has(postId) && !commentsMap[postId]) {
        setLoadingComments((prev) => new Set(prev).add(postId));
        const { data } = await supabase
          .from("wall_comments")
          .select("id, post_id, content, created_at, user_id, status")
          .eq("post_id", postId)
          .eq("status", "approved")
          .order("created_at", { ascending: true });
        setCommentsMap((prev) => ({ ...prev, postId: (data as WallComment[]) ?? [] }));
        setLoadingComments((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [expandedPosts, commentsMap]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId) return;
      const isLiked = likedPosts.has(postId);

      setLikedPosts((prev) => {
        const next = new Set(prev);
        isLiked ? next.delete(postId) : next.add(postId);
        return next;
      });

      if (isLiked) {
        await supabase.from("wall_likes").delete().eq("post_id", postId).eq("user_id", userId);
      } else {
        await supabase.from("wall_likes").insert({ post_id: postId, user_id: userId });
        trackLikePost(postId);
      }
    },
    [userId, likedPosts]
  );

  const handleComment = useCallback(
    async (postId: string) => {
      const content = (commentTexts[postId] || "").trim();
      if (!content || !userId || submittingComment.has(postId)) return;

      setSubmittingComment((prev) => new Set(prev).add(postId));

      try {
        const { data, error } = await supabase.functions.invoke("moderate-comment", {
          body: { post_id: postId, content },
        });

        if (error) throw error;

        if (data?.rejected) {
          toast({ title: "Comentario no publicado", description: data.reason, variant: "destructive" });
          return;
        }

        if (data?.success && data?.comment) {
          setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
          setCommentsMap((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), data.comment as WallComment],
          }));
          toast({ title: "¡Respuesta publicada!" });
          trackCommentPost(postId, content.length);
          // Notify post author (fire-and-forget)
          supabase.from("wall_posts").select("user_id").eq("id", postId).maybeSingle()
            .then(({ data: post }) => {
              if (post?.user_id && post.user_id !== userId) {
                supabase.functions.invoke("send-push-notification", {
                  body: { action: "reply", target_user_id: post.user_id },
                }).catch(() => {});
              }
            }).catch(() => {});
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "No se pudo publicar la respuesta.", variant: "destructive" });
      } finally {
        setSubmittingComment((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [commentTexts, userId, submittingComment, toast]
  );

  const handleDelete = useCallback(
    async (postId: string, refetch: () => void) => {
      if (confirmingDelete !== postId) {
        setConfirmingDelete(postId);
        setTimeout(() => setConfirmingDelete((prev) => (prev === postId ? null : prev)), 5000);
        return;
      }

      setConfirmingDelete(null);
      try {
        const { error } = await supabase
          .from("wall_posts")
          .delete()
          .eq("id", postId)
          .eq("user_id", userId ?? "");

        if (error) throw error;

        toast({ title: "Post eliminado" });
        trackDeletePost(postId);
        refetch();
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "No se pudo eliminar el post.", variant: "destructive" });
      }
    },
    [confirmingDelete, userId, toast]
  );

  const updateCommentText = useCallback((postId: string, text: string) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: text }));
  }, []);

  return {
    likedPosts,
    expandedPosts,
    commentsMap,
    loadingComments,
    commentTexts,
    submittingComment,
    confirmingDelete,
    toggleExpand,
    toggleLike,
    handleComment,
    handleDelete,
    updateCommentText,
    setCommentsMap,
  };
}
