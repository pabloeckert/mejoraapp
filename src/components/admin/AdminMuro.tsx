import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface WallPost {
  id: string;
  content: string;
  status: string;
  likes_count: number;
  created_at: string;
  user_id: string;
}

const statusColors: Record<string, string> = {
  approved: "text-green-600 bg-green-50",
  rejected: "text-red-600 bg-red-50",
  pending: "text-yellow-600 bg-yellow-50",
};

const AdminMuro = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchPosts = async () => {
    const query = supabase
      .from("wall_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data } = await query;
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const updateStatus = async (postId: string, newStatus: string) => {
    const { error } = await supabase
      .from("wall_posts")
      .update({ status: newStatus })
      .eq("id", postId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Post ${newStatus === "approved" ? "aprobado" : "rechazado"}` });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));
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
      <h2 className="text-lg font-bold text-foreground">Moderación del Muro ({posts.length})</h2>

      {/* Filters */}
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
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[post.status] || ""}`}>
                  {post.status}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ❤ {post.likes_count} · {new Date(post.created_at).toLocaleDateString("es-AR")}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line mb-2">{post.content}</p>
              <div className="flex gap-1.5">
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
              </div>
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
