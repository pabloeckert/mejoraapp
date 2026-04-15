import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, Heart, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";


interface WallPost {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user_id: string;
}

const MAX_LENGTH = 500;

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

const Muro = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<WallPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("wall_posts")
      .select("id, content, likes_count, created_at, user_id")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setPosts(data);
    setLoadingPosts(false);
  }, []);

  const fetchLikes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wall_likes")
      .select("post_id")
      .eq("user_id", user.id);
    if (data) setLikedPosts(new Set(data.map((l) => l.post_id)));
  }, [user]);

  useEffect(() => {
    fetchPosts();
    fetchLikes();
    const channel = supabase
      .channel("wall_posts_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_posts", filter: "status=eq.approved" },
        (payload) => {
          setPosts((prev) => [payload.new as WallPost, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts, fetchLikes]);

  const handlePost = async () => {
    const content = newPost.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke("moderate-post", {
        body: { content },
      });
      if (error) throw error;
      if (data?.rejected) {
        toast({ title: "Post no publicado", description: data.reason, variant: "destructive" });
      } else if (data?.success) {
        setNewPost("");
        toast({ title: "¡Publicado!", description: "Tu post ya está en el muro." });
        fetchPosts();
      } else if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo publicar. Intentá de nuevo.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const isLiked = likedPosts.has(postId);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p)
    );
    if (isLiked) {
      await supabase.from("wall_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("wall_likes").insert({ post_id: postId, user_id: user.id });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Muro Anónimo</h1>
        <p className="text-sm text-muted-foreground">
          Compartí tus dudas y experiencias. Sin nombres, sin ventas — solo negocio real.
        </p>
      </div>

      {/* Post composer */}
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
            <span className="text-xs text-muted-foreground">{newPost.length}/{MAX_LENGTH}</span>
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

      {/* Posts feed */}
      {loadingPosts ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
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
          {posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isOwn = post.user_id === user?.id;
            return (
              <Card key={post.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-muted-foreground">
                      {isOwn ? "Vos" : "Anónimo"} · {timeAgo(post.created_at)}
                    </span>
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-full
                        ${isLiked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                      {post.likes_count > 0 && <span>{post.likes_count}</span>}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Muro;
