import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Lightbulb,
  FileText,
  Brain,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Image as ImageIcon,
  Download,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { trackViewContent, trackSearchContent, trackFilterCategory } from "@/lib/analytics";
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

const getTypeBadge = (type: string) => {
  switch (type) {
    case "video":
      return { label: "Video", icon: Play, color: "bg-red-500/15 text-red-600 dark:text-red-400" };
    case "infographic":
      return { label: "Infografía", icon: ImageIcon, color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" };
    case "book":
      return { label: "Libro PDF", icon: BookOpen, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
    default:
      return { label: "Artículo", icon: FileText, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" };
  }
};

// --- Video embed ---
const VideoEmbed = ({ url }: { url: string }) => {
  // Convert YouTube watch URLs to embed
  const embedUrl = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/");

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video"
      />
    </div>
  );
};

// --- Image display ---
const ImageDisplay = ({ url, alt }: { url: string; alt: string }) => (
  <div className="rounded-lg overflow-hidden bg-muted">
    <img
      src={url}
      alt={alt}
      className="w-full h-auto max-h-[400px] object-cover"
      loading="lazy"
    />
  </div>
);

// --- PDF download ---
const PDFDownload = ({ url, title }: { url: string; title: string }) => (
  <a
    href={url}
    download
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors group"
  >
    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
      <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground">Descargar PDF</p>
      <p className="text-xs text-muted-foreground truncate">{title}</p>
    </div>
  </a>
);

// --- Expanded content panel ---
const ExpandedContent = ({ post, onClose }: { post: Post; onClose: () => void }) => {
  const typeBadge = getTypeBadge(post.content_type);

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-4 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
      {/* Media section */}
      {post.content_type === "video" && post.video_url && (
        <VideoEmbed url={post.video_url} />
      )}

      {post.content_type === "infographic" && post.imagen_url && (
        <ImageDisplay url={post.imagen_url} alt={post.titulo} />
      )}

      {post.content_type === "book" && post.pdf_url && (
        <div className="space-y-3">
          {post.imagen_url && (
            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 rounded-lg overflow-hidden shadow-lg">
                <img src={post.imagen_url} alt={post.titulo} className="w-full h-auto" />
              </div>
              <PDFDownload url={post.pdf_url} title={post.titulo} />
            </div>
          )}
          {!post.imagen_url && <PDFDownload url={post.pdf_url} title={post.titulo} />}
        </div>
      )}

      {post.content_type === "article" && post.imagen_url && (
        <ImageDisplay url={post.imagen_url} alt={post.titulo} />
      )}

      {/* Full content */}
      <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
        {post.contenido}
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs text-muted-foreground"
        onClick={onClose}
      >
        <X className="w-3 h-3 mr-1" />
        Cerrar
      </Button>
    </div>
  );
};

// --- Post card (collapsed by default) ---
const PostCard = ({
  post,
  isExpanded,
  onToggle,
}: {
  post: Post;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) => {
  // Truncate summary to 2 lines consistently
  const summary = (post.resumen || post.contenido || "").split("\n")[0].slice(0, 150);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onToggle(post.id)}>
      <CardContent className="p-4">
        {/* Category badge + Title + chevron */}
        {post.content_categories && (
          <span className={`inline-block text-caption font-medium px-2 py-0.5 rounded-full mb-2 ${getCategoryColor(post.content_categories.slug)}`}>
            {post.content_categories.nombre}
          </span>
        )}
        <div className="flex items-start gap-2">
          <h3 className="font-bold text-body text-foreground leading-snug flex-1">{post.titulo}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          )}
        </div>

        {/* Summary — always visible, uniform */}
        {!isExpanded && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
            {summary}
          </p>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <ExpandedContent post={post} onClose={() => onToggle(post.id)} />
        )}
      </CardContent>
    </Card>
  );
};

const PostSkeleton = () => (
  <Card>
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
);

const ContenidoDeValor = () => {
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    let result = posts;

    // Category filter
    if (activeFilter !== "todos") {
      result = result.filter((p) => p.content_categories?.slug === activeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          (p.resumen || "").toLowerCase().includes(q) ||
          (p.contenido || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, activeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginatedPosts = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleFilterChange = useCallback((value: string) => {
    setActiveFilter(value);
    setCurrentPage(1);
    setExpandedId(null);
    if (value !== "todos") trackFilterCategory(value);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setExpandedId(null);
  }, []);

  // Track search when results are computed
  const lastTrackedSearch = useRef<string>("");
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.trim() !== lastTrackedSearch.current) {
      lastTrackedSearch.current = searchQuery.trim();
      trackSearchContent(searchQuery.trim(), filtered.length);
    }
  }, [searchQuery, filtered.length]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => {
      const opening = prev !== id;
      if (opening) {
        const post = posts.find((p) => p.id === id);
        if (post) {
          trackViewContent(
            post.id,
            post.content_categories?.slug ?? "unknown",
            post.content_type
          );
        }
      }
      return prev === id ? null : id;
    });
  }, [posts]);

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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contenido..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category pills */}
      {!categoriesLoading && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => handleFilterChange("todos")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === "todos"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange(cat.slug)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Lightbulb className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery ? "Sin resultados" : "Todavía no hay publicaciones"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              {searchQuery
                ? `No encontramos contenido para "${searchQuery}". Probá con otras palabras.`
                : "Pronto vas a encontrar acá contenido pensado para tu negocio."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isExpanded={expandedId === post.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-1">
          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setCurrentPage(1); setExpandedId(null); }}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setExpandedId(null); }}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); setExpandedId(null); }}
                className={`min-w-[28px] h-7 rounded-md text-xs font-bold transition-colors
                  ${page === currentPage
                    ? "bg-mc-dark-blue text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); }}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentPage(totalPages); setExpandedId(null); }}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContenidoDeValor;
