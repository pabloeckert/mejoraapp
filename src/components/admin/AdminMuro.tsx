import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAction } from "@/hooks/useAdminAction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw, MessageSquare, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WallPost = Tables<"wall_posts">;

interface WallComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  status: string;
}

const statusColors: Record<string, string> = {
  approved: "text-green-600 bg-green-50 dark:bg-green-950/30",
  rejected: "text-red-600 bg-red-50 dark:bg-red-950/30",
  pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
};

const AdminMuro = () => {
  const { toast } = useToast();
  const { execute: adminAction } = useAdminAction();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, WallComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from("wall_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setPosts(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const updateStatus = async (postId: string, newStatus: string) => {
    try {
      await adminAction("moderate-post", { postId, status: newStatus });
      toast({ title: `Post ${newStatus === "approved" ? "aprobado" : "rechazado"}` });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const toggleExpand = async (postId: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });

    if (!expandedPosts.has(postId) && !commentsMap[postId]) {
      setLoadingComments((prev) => new Set(prev).add(postId));
      const { data } = await supabase
        .from("wall_comments")
        .select("id, post_id, content, created_at, user_id, status")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setCommentsMap((prev) => ({ ...prev, [postId]: (data as WallComment[]) || [] }));
      setLoadingComments((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const updateCommentStatus = async (commentId: string, postId: string, newStatus: string) => {
    try {
      await adminAction("moderate-comment", { commentId, status: newStatus });
      toast({ title: `Comentario ${newStatus === "approved" ? "aprobado" : "rechazado"}` });
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) => (c.id === commentId ? { ...c, status: newStatus } : c)),
      }));
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const counts = {
    all: posts.length,
    approved: posts.filter((p) => p.status === "approved").length,
    rejected: posts.filter((p) => p.status === "rejected").length,
    pending: posts.filter((p) => p.status === "pending").length,
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Moderación del Muro ({posts.length})</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchPosts} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["all", "approved", "rejected", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
              ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {f === "all" ? "Todos" : f === "approved" ? "Aprobados" : f === "rejected" ? "Rechazados" : "Pendientes"} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-caption font-medium px-2 py-0.5 rounded-full ${statusColors[post.status] || ""}`}>
                  {post.status}
                </span>
                <span className="text-caption text-muted-foreground">
                  ❤ {post.likes_count} · 💬 {post.comments_count} · {new Date(post.created_at).toLocaleDateString("es-AR")}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line mb-2">{post.content}</p>
              <div className="flex gap-1.5 flex-wrap">
                {post.status !== "approved" && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-600" onClick={() => updateStatus(post.id, "approved")}>
                    <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                  </Button>
                )}
                {post.status !== "rejected" && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600" onClick={() => updateStatus(post.id, "rejected")}>
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={() => toggleExpand(post.id)}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comentarios ({post.comments_count})
                  {expandedPosts.has(post.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>

              {expandedPosts.has(post.id) && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  {loadingComments.has(post.id) ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (commentsMap[post.id] || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">Sin comentarios.</p>
                  ) : (
                    (commentsMap[post.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-2 items-start py-1.5">
                        <CornerDownRight className="w-3 h-3 text-muted-foreground/50 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[c.status] || ""}`}>
                              {c.status}
                            </span>
                            <span className="text-caption text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/80 whitespace-pre-line">{c.content}</p>
                          <div className="flex gap-1 mt-1">
                            {c.status !== "approved" && (
                              <Button size="sm" variant="outline" className="h-6 text-caption gap-1 text-green-600 px-2" onClick={() => updateCommentStatus(c.id, post.id, "approved")}>
                                <CheckCircle className="w-3 h-3" /> OK
                              </Button>
                            )}
                            {c.status !== "rejected" && (
                              <Button size="sm" variant="outline" className="h-6 text-caption gap-1 text-red-600 px-2" onClick={() => updateCommentStatus(c.id, post.id, "rejected")}>
                                <XCircle className="w-3 h-3" /> Rechazar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            No hay posts con ese filtro.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMuro;
