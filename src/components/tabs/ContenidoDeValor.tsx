import { useState, useEffect } from "react";
import { Lightbulb, FileText, Brain, Newspaper, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, typeof Lightbulb> = {
  Lightbulb,
  FileText,
  Brain,
  Newspaper,
};

interface Category {
  id: string;
  nombre: string;
  slug: string;
  icono: string;
}

interface Post {
  id: string;
  titulo: string;
  contenido: string;
  published_at: string;
  category_id: string;
  content_categories?: { nombre: string; slug: string; icono: string } | null;
}

const ContenidoDeValor = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, postRes] = await Promise.all([
        supabase.from("content_categories").select("*").eq("activa", true).order("created_at"),
        supabase
          .from("content_posts")
          .select("*, content_categories(nombre, slug, icono)")
          .eq("estado", "publicado")
          .order("published_at", { ascending: false })
          .limit(50),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (postRes.data) setPosts(postRes.data as any);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = activeFilter
    ? posts.filter((p) => p.content_categories?.slug === activeFilter)
    : posts;

  const getIcon = (iconName?: string) => ICON_MAP[iconName || ""] || Lightbulb;

  const getCategoryColor = (slug?: string) => {
    switch (slug) {
      case "tip": return "bg-mc-yellow/15 text-mc-yellow";
      case "estrategia": return "bg-mc-blue/15 text-mc-blue";
      case "reflexion": return "bg-mc-red/15 text-mc-red";
      case "noticia": return "bg-mc-dark-blue/15 text-mc-dark-blue";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Contenido de Valor</h1>
        <p className="text-sm text-muted-foreground">
          Tips, estrategias y reflexiones para tu negocio.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border
            ${!activeFilter
              ? "bg-mc-dark-blue text-white border-mc-dark-blue shadow-md"
              : "bg-background text-muted-foreground border-border hover:border-mc-dark-blue/40 hover:text-foreground"}`}
        >
          Todos
        </button>
        {categories.map((cat) => {
          const Icon = getIcon(cat.icono);
          const isActive = activeFilter === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(isActive ? null : cat.slug)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all border
                ${isActive
                  ? "bg-mc-dark-blue text-white border-mc-dark-blue shadow-md"
                  : "bg-background text-muted-foreground border-border hover:border-mc-dark-blue/40 hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.nombre}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Lightbulb className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Todavía no hay publicaciones</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Pronto vas a encontrar acá contenido pensado para tu negocio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const cat = post.content_categories;
            const Icon = getIcon(cat?.icono);
            const date = new Date(post.published_at);
            return (
              <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(cat?.slug)}`}>
                      <Icon className="w-3 h-3" />
                      {cat?.nombre || "General"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-snug">{post.titulo}</h3>
                  <div className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">
                    {post.contenido}
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

export default ContenidoDeValor;
