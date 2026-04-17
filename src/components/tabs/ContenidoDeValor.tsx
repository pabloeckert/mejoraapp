import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, FileText, Brain, Newspaper, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const ICON_MAP: Record<string, typeof Lightbulb> = {
  Lightbulb,
  FileText,
  Brain,
  Newspaper,
};

const POSTS_PER_PAGE = 10;

type Category = Tables<"content_categories">;
type Post = Tables<"content_posts"> & {
  content_categories?: { nombre: string; slug: string; icono: string } | null;
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("content_categories")
    .select("*")
    .eq("activa", true)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
};

const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("content_posts")
    .select("*, content_categories(nombre, slug, icono)")
    .eq("estado", "publicado")
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as Post[]) ?? [];
};

const getCategoryColor = (slug?: string) => {
  switch (slug) {
    case "tip": return "bg-mc-yellow/15 text-mc-yellow";
    case "estrategia": return "bg-mc-blue/15 text-mc-blue";
    case "reflexion": return "bg-mc-red/15 text-mc-red";
    case "noticia": return "bg-mc-dark-blue/15 text-mc-dark-blue";
    default: return "bg-muted text-muted-foreground";
  }
};

const getIcon = (iconName?: string) => ICON_MAP[iconName || ""] || Lightbulb;

const PostSkeleton = () => (
  <Card>
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
);

const ContenidoDeValor = () => {
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["content-categories"],
    queryFn: fetchCategories,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["content-posts"],
    queryFn: fetchPosts,
  });

  const isLoading = categoriesLoading || postsLoading;

  const filtered = useMemo(() => {
    if (activeFilter === "todos") return posts;
    return posts.filter((p) => p.content_categories?.slug === activeFilter);
  }, [posts, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginatedPosts = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleFilterChange = useCallback((value: string) => {
    setActiveFilter(value);
    setCurrentPage(1);
  }, []);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Contenido de Valor</h1>
        <p className="text-sm text-muted-foreground">
          Tips, estrategias y reflexiones para tu negocio.
        </p>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}
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
          {paginatedPosts.map((post) => {
            const cat = post.content_categories;
            const Icon = getIcon(cat?.icono);
            const date = new Date(post.published_at ?? post.created_at);
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

      {/* Bottom bar: Pagination + Filter */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-2 pb-1">
          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[28px] h-7 rounded-md text-xs font-bold transition-colors
                  ${page === currentPage
                    ? "bg-mc-dark-blue text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter dropdown */}
          <Select value={activeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs font-bold border-border gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ContenidoDeValor;
