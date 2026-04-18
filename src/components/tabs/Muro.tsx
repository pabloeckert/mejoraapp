import { useState, useCallback, memo, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  Heart,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai";

interface WallPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  status: string;
}

interface WallComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  status: string;
}

const MAX_LENGTH = 500;
const COMMENT_MAX_LENGTH = 300;
const POSTS_PER_PAGE = 20;

const MODERATION_PROMPT = `Sos el moderador de una comunidad de negocios argentina. Tu trabajo es decidir si un post anónimo es apropiado o no.

APROBÁS si:
- Comparte una experiencia de negocio (buena o mala)
- Hace una pregunta genuina sobre emprendimiento
- Expresa frustración real sobre su situación empresarial
- Pide consejo o perspectiva sobre negocios
- Comparte un aprendizaje o reflexión de negocio

RECHAZÁS si:
- Contiene spam, publicidad o promoción de servicios
- Tiene insultos directos a personas o empresas con nombre
- Incluye información personal identificable (teléfonos, direcciones, emails)
- Contenido sexual, violento o discriminatorio
- Es completamente irrelevante al mundo de los negocios
- Intenta vender algo o captar clientes

SÉ PERMISIVO con el tono argentino: puteadas leves, frustración genuina, ironía y sarcasmo son parte de la cultura. No censures por tono, solo por contenido dañino.

Respondé ÚNICAMENTE en formato JSON: {"action": "approved" o "rejected", "reason": "razón breve en español"}`;

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
};

const fetchWallPosts = async ({ pageParam }: { pageParam: number }) => {
  const from = pageParam * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const { data, error } = await supabase
    .from("wall_posts")
    .select("id, content, likes_count, comments_count, created_at, user_id, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return (data as WallPost[]) ?? [];
};

const fetchComments = async (postId: string): Promise<WallComment[]> => {
  const { data, error } = await supabase
    .from("wall_comments")
    .select("id, post_id, content, created_at, user_id, status")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as WallComment[]) ?? [];
};

const fetchUserLikes = async (userId: string): Promise<Set<string>> => {
  const { data } = await supabase
    .from("wall_likes")
    .select("post_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((l) => l.post_id));
};

// --- Comment component ---
const CommentItem = memo(({ comment, isOwn }: { comment: WallComment; isOwn: boolean }) => (
  <div className="flex gap-2 items-start py-1.5">
    <CornerDownRight className="w-3 h-3 text-muted-foreground/50 mt-1 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{comment.content}</p>
      <span className="text-[10px] text-muted-foreground">
        {isOwn ? "Vos" : "Anónimo"} · {timeAgo(comment.created_at)}
      </span>
    </div>
  </div>
));
CommentItem.displayName = "CommentItem";

// --- Post card with collapsible comments ---
const PostCard = memo(
  ({
    post,
    isLiked,
    isOwn,
    onLike,
    expanded,
    onToggle,
    comments,
    loadingComments,
    onComment,
    commentText,
    onCommentTextChange,
    submittingComment,
    userId,
  }: {
    post: WallPost;
    isLiked: boolean;
    isOwn: boolean;
    onLike: (postId: string) => void;
    expanded: boolean;
    onToggle: (postId: string) => void;
    comments: WallComment[];
    loadingComments: boolean;
    onComment: (postId: string) => void;
    commentText: string;
    onCommentTextChange: (postId: string, text: string) => void;
    submittingComment: boolean;
    userId: string | undefined;
  }) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        {/* Post content */}
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              {isOwn ? "Vos" : "Anónimo"} · {timeAgo(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-full
                ${isLiked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"}`}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? "fill-current scale-110" : ""}`} />
              {post.likes_count > 0 && <span>{post.likes_count}</span>}
            </button>

            <button
              onClick={() => onToggle(post.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-full hover:bg-secondary"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {post.comments_count > 0 && <span>{post.comments_count}</span>}
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded comments section */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
            {loadingComments ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-2">
                    Sin respuestas todavía. Sé el primero.
                  </p>
                )}
                {comments.map((c) => (
                  <CommentItem key={c.id} comment={c} isOwn={c.user_id === userId} />
                ))}
              </>
            )}

            {/* Reply input */}
            <div className="flex gap-2 items-end mt-2 pt-2 border-t border-border/30">
              <Textarea
                placeholder="Escribí una respuesta..."
                value={commentText}
                onChange={(e) => onCommentTextChange(post.id, e.target.value.slice(0, COMMENT_MAX_LENGTH))}
                className="min-h-[36px] h-[36px] text-xs resize-none border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 py-2"
                maxLength={COMMENT_MAX_LENGTH}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onComment(post.id);
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 shrink-0"
                onClick={() => onComment(post.id)}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            <span className="text-[10px] text-muted-foreground">{commentText.length}/{COMMENT_MAX_LENGTH}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
);
PostCard.displayName = "PostCard";

const PostSkeleton = () => (
  <Card>
    <CardContent className="p-3 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between mt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const Muro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  // Expanded posts (comments visible)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, WallComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  // Comment input per post
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["wall-posts"],
    queryFn: fetchWallPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined;
      return pages.length;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!user) return;
    fetchUserLikes(user.id).then(setLikedPosts);
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("wall_posts_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_posts", filter: "status=eq.approved" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["wall-posts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_comments", filter: "status=eq.approved" },
        (payload) => {
          const comment = payload.new as WallComment;
          // If this post is expanded, refresh its comments
          if (expandedPosts.has(comment.post_id)) {
            fetchComments(comment.post_id).then((c) => {
              setCommentsMap((prev) => ({ ...prev, [comment.post_id]: c }));
            });
          }
          // Invalidate posts to update comments_count
          queryClient.invalidateQueries({ queryKey: ["wall-posts"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, expandedPosts]);

  const allPosts = data?.pages.flat() ?? [];

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

      // Fetch comments if expanding and not already loaded
      if (!expandedPosts.has(postId) && !commentsMap[postId]) {
        setLoadingComments((prev) => new Set(prev).add(postId));
        const comments = await fetchComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
        setLoadingComments((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [expandedPosts, commentsMap]
  );

  const handleComment = useCallback(
    async (postId: string) => {
      const content = (commentTexts[postId] || "").trim();
      if (!content || !user || submittingComment.has(postId)) return;

      setSubmittingComment((prev) => new Set(prev).add(postId));

      try {
        const { data: comment, error } = await supabase
          .from("wall_comments")
          .insert({
            post_id: postId,
            user_id: user.id,
            content,
            status: "approved",
          })
          .select("id, post_id, content, created_at, user_id, status")
          .single();

        if (error) throw error;

        // Clear input
        setCommentTexts((prev) => ({ ...prev, [postId]: "" }));

        // Optimistically add comment
        if (comment) {
          setCommentsMap((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), comment as WallComment],
          }));
        }

        toast({ title: "¡Respuesta publicada!" });
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
    [commentTexts, user, submittingComment, toast]
  );

  const handlePost = useCallback(async () => {
    const content = newPost.trim();
    if (!content || posting || !user) return;
    setPosting(true);

    try {
      // 1. Moderar con IA
      const configured = aiService.getConfiguredProviders();
      let modAction = "approved";
      let modReason = "Publicado";

      if (configured.length > 0) {
        try {
          const { content: aiResponse } = await aiService.chat(
            MODERATION_PROMPT,
            `Moderá este post del muro anónimo:\n\n"${content}"`
          );
          const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            modAction = parsed.action || "approved";
            modReason = parsed.reason || "Moderado por IA";
          }
        } catch (aiErr) {
          console.warn("AI moderation failed, approving by default:", aiErr);
          modAction = "approved";
          modReason = "Aprobado automáticamente (IA no disponible)";
        }
      }

      // 2. Insertar en Supabase
      const { data: post, error: insertError } = await supabase
        .from("wall_posts")
        .insert({
          user_id: user.id,
          content: content,
          status: modAction,
        })
        .select("id, status")
        .single();

      if (insertError) {
        if (insertError.code === "42501" || insertError.message?.includes("policy")) {
          const { data: fnData, error: fnError } = await supabase.functions.invoke("moderate-post", {
            body: { content },
          });
          if (fnError) throw fnError;
          if (fnData?.rejected) {
            toast({ title: "Post no publicado", description: fnData.reason, variant: "destructive" });
          } else if (fnData?.success) {
            setNewPost("");
            toast({ title: "¡Publicado!", description: "Tu post ya está en el muro." });
            refetch();
          }
          setPosting(false);
          return;
        }
        throw insertError;
      }

      // 3. Log de moderación
      if (post) {
        try {
          await supabase.from("moderation_log").insert({
            post_id: post.id,
            action: modAction,
            reason: modReason,
          });
        } catch {}
      }

      if (modAction === "rejected") {
        toast({
          title: "Post no publicado",
          description: "Tu post no cumple con las normas de la comunidad.",
          variant: "destructive",
        });
      } else {
        setNewPost("");
        toast({ title: "¡Publicado!", description: "Tu post ya está en el muro." });
        refetch();
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo publicar. Intentá de nuevo.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  }, [newPost, posting, user, toast, refetch]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;
      const isLiked = likedPosts.has(postId);

      setLikedPosts((prev) => {
        const next = new Set(prev);
        isLiked ? next.delete(postId) : next.add(postId);
        return next;
      });

      if (isLiked) {
        await supabase.from("wall_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("wall_likes").insert({ post_id: postId, user_id: user.id });
      }
    },
    [user, likedPosts]
  );

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Muro Anónimo</h1>
          <p className="text-sm text-muted-foreground">
            Compartí tus dudas y experiencias. Sin nombres, sin ventas.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 space-y-2">
          <Textarea
            placeholder="¿Qué te está pasando con tu negocio? Acá es anónimo..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value.slice(0, MAX_LENGTH))}
            className="min-h-[80px] resize-none border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            maxLength={MAX_LENGTH}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newPost.length}/{MAX_LENGTH}
            </span>
            <Button size="sm" onClick={handlePost} disabled={!newPost.trim() || posting} className="gap-1.5">
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Publicar
            </Button>
          </div>
          <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>Tu post es anónimo y moderado por IA. No se permiten ventas, promos ni datos personales.</span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : allPosts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">El muro está vacío</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Sé el primero en compartir. Todo es anónimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPosts.has(post.id)}
              isOwn={post.user_id === user?.id}
              onLike={toggleLike}
              expanded={expandedPosts.has(post.id)}
              onToggle={toggleExpand}
              comments={commentsMap[post.id] || []}
              loadingComments={loadingComments.has(post.id)}
              onComment={handleComment}
              commentText={commentTexts[post.id] || ""}
              onCommentTextChange={(id, text) => setCommentTexts((prev) => ({ ...prev, [id]: text }))}
              submittingComment={submittingComment.has(post.id)}
              userId={user?.id}
            />
          ))}

          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Muro;
