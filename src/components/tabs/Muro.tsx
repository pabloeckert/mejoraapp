/**
 * Muro — Muro anónimo de MejoraApp
 *
 * Orchestrator component. Sub-components extracted:
 * - PostCard, CommentItem, PostSkeleton → ./muro/
 * - CommunityRules → standalone component
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWallInteractions, type WallComment } from "@/hooks/useWallInteractions";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { CommunityRanking } from "@/components/CommunityRanking";
import { CommunityRules } from "@/components/CommunityRules";
import { trackPublishPost } from "@/lib/analytics";
import { ReportDialog } from "@/components/ReportDialog";
import { PostCard, PostSkeleton, type WallPost, type PostType, POST_TYPE_CONFIG, MAX_LENGTH, POSTS_PER_PAGE } from "@/components/muro";
import { fetchWallPostsPage } from "@/services/wall.service";

const Muro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
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
  } = useWallInteractions(user?.id);

  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<PostType>("consulta");
  const [filterType, setFilterType] = useState<PostType | "all">("all");
  const [posting, setPosting] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; content: string } | null>(null);

  const postsDataRef = useRef<WallPost[]>([]);
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
    queryFn: fetchWallPostsPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined;
      return pages.length;
    },
    staleTime: 30_000,
  });

  // Keep refs for values used in realtime callbacks to avoid re-subscribing
  const expandedPostsRef = useRef(expandedPosts);
  useEffect(() => { expandedPostsRef.current = expandedPosts; }, [expandedPosts]);

  // Realtime subscription — only re-subscribe when user changes
  useEffect(() => {
    const channelName = `wall_realtime_${user?.id ?? "anon"}`;
    const existing = supabase.getChannels().find((c) => c.topic === channelName);
    if (existing) supabase.removeChannel(existing);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_posts", filter: "status=eq.approved" },
        () => queryClient.invalidateQueries({ queryKey: ["wall-posts"] })
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_comments", filter: "status=eq.approved" },
        (payload) => {
          const comment = payload.new as WallComment;
          const userPost = postsDataRef.current.find((p) => p.id === comment.post_id && p.user_id === user?.id);
          if (userPost && comment.user_id !== user?.id) {
            toast({
              title: "💬 Nueva respuesta en tu post",
              description: comment.content.length > 60 ? comment.content.slice(0, 60) + "…" : comment.content,
            });
          }
          if (expandedPostsRef.current.has(comment.post_id)) {
            supabase
              .from("wall_comments")
              .select("id, post_id, content, created_at, user_id, status")
              .eq("post_id", comment.post_id)
              .eq("status", "approved")
              .order("created_at", { ascending: true })
              .then(({ data }) => {
                setCommentsMap((prev) => ({ ...prev, [comment.post_id]: (data as WallComment[]) ?? [] }));
              });
          }
          queryClient.invalidateQueries({ queryKey: ["wall-posts"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // expandedPosts excluded intentionally: we use expandedPostsRef.current inside the callback
  // to avoid re-subscribing on every expand/collapse action
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, user, toast, setCommentsMap]);

  const allPosts = data?.pages.flat() ?? [];
  const filteredPosts = filterType === "all" ? allPosts : allPosts.filter((p) => p.post_type === filterType);
  useEffect(() => { postsDataRef.current = allPosts; }, [allPosts]);

  const handleReport = useCallback((postId: string, content: string) => {
    setReportTarget({ id: postId, content });
  }, []);

  const { pullDistance, isRefreshing, isReady, handlers } = usePullToRefresh({
    onRefresh: () => { refetch(); },
  });

  // POST via Edge Function
  const handlePost = useCallback(async () => {
    const content = newPost.trim();
    if (!content || posting || !user) return;

    setPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke("moderate-post", { body: { content, post_type: postType } });
      if (error) throw error;

      if (data?.rejected) {
        toast({ title: "Post no publicado", description: data.reason, variant: "destructive" });
      } else if (data?.success) {
        setNewPost("");
        toast({ title: "¡Publicado!", description: "Tu post ya está en el muro." });
        trackPublishPost(content.length);
        refetch();
        supabase.functions.invoke("send-push-notification", {
          body: { action: "new_post", exclude_user_id: user.id },
        }).catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo publicar. Intentá de nuevo.";
      console.error(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  }, [newPost, posting, user, toast, refetch, postType]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-4 animate-fade-in touch-pan-y" {...handlers}>
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex justify-center transition-all duration-200 overflow-hidden"
          style={{ height: isRefreshing ? 40 : pullDistance }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowDown
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: isReady ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            )}
            <span className="text-xs">
              {isRefreshing ? "Actualizando…" : isReady ? "Soltá para actualizar" : "Jalá para actualizar"}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Muro Anónimo</h1>
          <p className="text-sm text-muted-foreground">
            {allPosts.length > 0
              ? `${allPosts.length} post${allPosts.length !== 1 ? "s" : ""} · Compartí tus dudas. Sin nombres, sin ventas.`
              : "Compartí tus dudas y experiencias. Sin nombres, sin ventas."}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* New post form */}
      <Card>
        <CardContent className="p-3 space-y-2">
          {/* Post type selector */}
          <div className="flex gap-1.5">
            {(Object.keys(POST_TYPE_CONFIG) as PostType[]).map((type) => {
              const config = POST_TYPE_CONFIG[type];
              const isSelected = postType === type;
              return (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.color} ring-1 ring-current/20`
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {config.emoji} {config.label}
                </button>
              );
            })}
          </div>

          <Textarea
            placeholder="¿Qué te está pasando con tu negocio? Acá es anónimo..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value.slice(0, MAX_LENGTH))}
            className="min-h-[80px] resize-none border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            maxLength={MAX_LENGTH}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handlePost();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs transition-colors ${
                newPost.length >= 480
                  ? "text-destructive font-medium"
                  : newPost.length >= 400
                    ? "text-amber-500"
                    : "text-muted-foreground"
              }`}
            >
              {newPost.length}/{MAX_LENGTH}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted-foreground hidden sm:inline">Ctrl+Enter</span>
              <Button size="sm" onClick={handlePost} disabled={!newPost.trim() || posting} className="gap-1.5">
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publicar
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-1.5 text-caption text-muted-foreground">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>Tu post es anónimo y moderado por IA. No se permiten ventas, promos ni datos personales.</span>
          </div>
        </CardContent>
      </Card>

      {/* Community rules */}
      <CommunityRules />

      {/* Ranking */}
      <CommunityRanking currentUserId={user?.id} limit={10} />

      {/* Filter by type */}
      {allPosts.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterType("all")}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
              filterType === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Todos
          </button>
          {(Object.keys(POST_TYPE_CONFIG) as PostType[]).map((type) => {
            const config = POST_TYPE_CONFIG[type];
            const count = allPosts.filter((p) => p.post_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  filterType === type
                    ? `${config.bgColor} ${config.color} ring-1 ring-current/20`
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {config.emoji} {config.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {filterType !== "all" ? `Sin ${POST_TYPE_CONFIG[filterType].label.toLowerCase()}s` : "El muro está vacío"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
              {filterType !== "all"
                ? `No hay publicaciones de tipo "${POST_TYPE_CONFIG[filterType].label}" todavía.`
                : "Sé el primero en compartir. Todo es anónimo."}
            </p>
            <p className="text-xs text-muted-foreground">
              ¿Tenés dudas? Probá el{" "}
              <button
                onClick={() => {
                  const event = new CustomEvent("navigate-tab", { detail: "diagnostico" });
                  window.dispatchEvent(event);
                }}
                className="text-mc-diag-blue font-semibold hover:underline"
              >
                diagnóstico estratégico
              </button>{" "}
              para entender mejor tu negocio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPosts.has(post.id)}
              isOwn={post.user_id === user?.id}
              onLike={toggleLike}
              onDelete={(id) => handleDelete(id, refetch)}
              confirmingDelete={confirmingDelete === post.id}
              onReport={handleReport}
              expanded={expandedPosts.has(post.id)}
              onToggle={toggleExpand}
              comments={commentsMap[post.id] || []}
              loadingComments={loadingComments.has(post.id)}
              onComment={handleComment}
              commentText={commentTexts[post.id] || ""}
              onCommentTextChange={updateCommentText}
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
      {/* Report dialog */}
      {reportTarget && (
        <ReportDialog
          open={!!reportTarget}
          onOpenChange={(open) => !open && setReportTarget(null)}
          postId={reportTarget.id}
          postContent={reportTarget.content}
        />
      )}
    </div>
  );
};

export default Muro;
