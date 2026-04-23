import { useState, useEffect } from "react";
import { Plus, Sparkles, Loader2, Trash2, Eye, EyeOff, Settings2, Play, Image as ImageIcon, Download, BookOpen, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAction } from "@/hooks/useAdminAction";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Category = Tables<"content_categories">;
type Post = Tables<"content_posts"> & {
  content_categories?: { nombre: string } | null;
};

type View = "posts" | "new-post" | "ai-generate" | "categories";

const CONTENT_TYPES = [
  { value: "article", label: "Artículo", icon: FileText },
  { value: "video", label: "Video", icon: Play },
  { value: "infographic", label: "Infografía", icon: ImageIcon },
  { value: "book", label: "Libro PDF", icon: BookOpen },
];

const CATEGORY_PROMPTS: Record<string, string> = {
  tip: "un tip práctico y accionable que pueda aplicar hoy mismo. Que sea contundente, en 2-3 párrafos cortos. Que empiece nombrando el dolor y termine con una acción concreta",
  estrategia: "un artículo corto (3-4 párrafos) con una estrategia concreta. Usá la estructura ESPEJO→DOLOR→SALIDA. Que el lector sienta que le están hablando a él",
  reflexion: "una reflexión provocadora que lo haga cuestionar su forma de operar. Usá la estructura de CONFRONTACIÓN DIRECTA. Que incomode para ordenar",
  noticia: "un análisis breve de una tendencia o situación actual relevante para negocios. Que sea concreto, útil y con una bajada práctica",
};

// AI generation is now server-side via Edge Functions

const getTypeBadge = (type: string) => {
  const t = CONTENT_TYPES.find((c) => c.value === type);
  return t || CONTENT_TYPES[0];
};

const AdminContenido = () => {
  const { toast } = useToast();
  const { execute: adminAction } = useAdminAction();
  const [view, setView] = useState<View>("posts");
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // New post form
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [resumen, setResumen] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contentType, setContentType] = useState("article");
  const [imagenUrl, setImagenUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // AI generate
  const [aiCategory, setAiCategory] = useState("");
  const [aiGuidelines, setAiGuidelines] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<{ titulo: string; contenido: string; resumen: string } | null>(null);

  // New category
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [catRes, postRes] = await Promise.all([
      supabase.from("content_categories").select("*").order("created_at"),
      supabase
        .from("content_posts")
        .select("*, content_categories(nombre)")
        .order("published_at", { ascending: false })
        .limit(100),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (postRes.data) setPosts(postRes.data as Post[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Ensure default content categories exist
  useEffect(() => {
    if (categories.length === 0 && !loading) {
      const defaults = [
        { nombre: "Tip", slug: "tip", icono: "Lightbulb", activa: true },
        { nombre: "Estrategia", slug: "estrategia", icono: "Brain", activa: true },
        { nombre: "Reflexión", slug: "reflexion", icono: "FileText", activa: true },
        { nombre: "Noticia", slug: "noticia", icono: "Newspaper", activa: true },
      ];
      Promise.all(
        defaults.map((d) => adminAction("create-category", { category: d }))
      ).then(() => fetchData());
    }
  }, [categories.length, loading]);

  const resetForm = () => {
    setTitulo("");
    setContenido("");
    setResumen("");
    setCategoryId("");
    setContentType("article");
    setImagenUrl("");
    setVideoUrl("");
    setPdfUrl("");
  };

  const savePost = async (estado: string = "publicado") => {
    if (!titulo.trim() || !contenido.trim()) {
      toast({ title: "Completá título y contenido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      resumen: resumen.trim() || null,
      category_id: categoryId || null,
      content_type: contentType,
      imagen_url: imagenUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      pdf_url: pdfUrl.trim() || null,
      estado,
      fuente: "admin",
    };
    try {
      await adminAction("create-post", { post: payload });
      toast({ title: estado === "publicado" ? "Publicado" : "Guardado como borrador" });
      resetForm();
      setView("posts");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
    setSaving(false);
  };

  const generateWithAI = async () => {
    if (!aiCategory) {
      toast({ title: "Elegí una categoría", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setAiPreview(null);

    try {
      const cat = categories.find((c) => c.id === aiCategory);

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          category: cat?.slug || "tip",
          guidelines: aiGuidelines || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiPreview({
        titulo: data.titulo || "Contenido generado",
        contenido: data.contenido || "",
        resumen: data.resumen || (data.contenido || "").slice(0, 120),
      });
      toast({ title: "Contenido generado ✨" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error al generar", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const publishAiContent = async () => {
    if (!aiPreview) return;
    setSaving(true);
    const payload = {
      titulo: aiPreview.titulo,
      contenido: aiPreview.contenido,
      resumen: aiPreview.resumen || null,
      category_id: aiCategory || null,
      content_type: "article",
      estado: "publicado",
      fuente: "ia",
    };
    try {
      await adminAction("create-post", { post: payload });
      toast({ title: "Publicado con IA" });
      setAiPreview(null);
      setAiGuidelines("");
      setView("posts");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
    setSaving(false);
  };

  const togglePostEstado = async (post: Post) => {
    const newEstado = post.estado === "publicado" ? "borrador" : "publicado";
    await adminAction("update-post-status", { postId: post.id, estado: newEstado });
    fetchData();
  };

  const deletePost = async (id: string) => {
    await adminAction("delete-post", { postId: id });
    fetchData();
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, "-");
    try {
      await adminAction("create-category", { category: { nombre: newCatName.trim(), slug } });
      setNewCatName("");
      setNewCatSlug("");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  // AI is server-side — always available if Edge Function secrets are configured

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={view === "posts" ? "default" : "outline"} onClick={() => setView("posts")}>
          Publicaciones
        </Button>
        <Button size="sm" variant={view === "new-post" ? "default" : "outline"} onClick={() => setView("new-post")}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Crear
        </Button>
        <Button size="sm" variant={view === "ai-generate" ? "default" : "outline"} onClick={() => setView("ai-generate")}>
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Generar con IA
          
        </Button>
        <Button size="sm" variant={view === "categories" ? "default" : "outline"} onClick={() => setView("categories")}>
          <Settings2 className="w-3.5 h-3.5 mr-1" /> Categorías
        </Button>
      </div>

      {view === "posts" && (
        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay publicaciones aún</p>
          ) : (
            posts.map((post) => {
              const badge = getTypeBadge(post.content_type);
              const BadgeIcon = badge.icon;
              return (
                <Card key={post.id} className={post.estado !== "publicado" ? "opacity-60" : ""}>
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {post.content_categories?.nombre || "Sin cat."}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${badge.value === "video" ? "bg-red-500/10 text-red-600" : badge.value === "infographic" ? "bg-purple-500/10 text-purple-600" : badge.value === "book" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
                          <BadgeIcon className="w-2.5 h-2.5" />
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {post.fuente === "ia" ? "🤖" : "✍️"}
                        </span>
                        {post.estado !== "publicado" && (
                          <span className="text-[10px] text-orange-500 font-bold">Borrador</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-foreground truncate">{post.titulo}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.contenido}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePostEstado(post)}>
                        {post.estado === "publicado" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deletePost(post.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {view === "new-post" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Nueva publicación</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* Content type selector */}
            <div className="flex gap-2 flex-wrap">
              {CONTENT_TYPES.map((t) => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setContentType(t.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                      ${contentType === t.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    <TIcon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input placeholder="Título contundente" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

            <Textarea placeholder="Resumen corto (se ve en la tarjeta colapsada)..." rows={2} value={resumen} onChange={(e) => setResumen(e.target.value)} />

            <Textarea placeholder="Contenido completo (se ve al expandir)..." rows={6} value={contenido} onChange={(e) => setContenido(e.target.value)} />

            {/* Media URL fields based on content type */}
            {(contentType === "video") && (
              <Input placeholder="URL del video (YouTube embed o watch)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            )}
            {(contentType === "infographic" || contentType === "article") && (
              <Input placeholder="URL de la imagen" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
            )}
            {contentType === "book" && (
              <>
                <Input placeholder="URL del PDF descargable" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
                <Input placeholder="URL de la portada (imagen)" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={() => savePost("publicado")} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Publicar
              </Button>
              <Button variant="outline" onClick={() => savePost("borrador")} disabled={saving}>
                Guardar borrador
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "ai-generate" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Generar contenido con IA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={aiCategory} onValueChange={setAiCategory}>
              <SelectTrigger><SelectValue placeholder="Categoría para generar" /></SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => CATEGORY_PROMPTS[c.slug])
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Lineamientos adicionales para la IA (opcional). Ej: 'Enfocate en pymes de servicios'..."
              rows={3}
              value={aiGuidelines}
              onChange={(e) => setAiGuidelines(e.target.value)}
            />
            <Button onClick={generateWithAI} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              Generar
            </Button>

            {aiPreview && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                <h4 className="font-bold text-foreground text-sm">{aiPreview.titulo}</h4>
                {aiPreview.resumen && (
                  <p className="text-xs text-muted-foreground">{aiPreview.resumen}</p>
                )}
                <p className="text-sm text-foreground/85 whitespace-pre-line">{aiPreview.contenido}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={publishAiContent} disabled={saving}>
                    Publicar
                  </Button>
                  <Button size="sm" variant="outline" onClick={generateWithAI} disabled={generating}>
                    Regenerar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {view === "categories" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Categorías</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div>
                  <span className="text-sm font-semibold">{cat.nombre}</span>
                  <span className="text-xs text-muted-foreground ml-2">/{cat.slug}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="Nombre" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1" />
              <Input placeholder="Slug" value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} className="w-28" />
              <Button size="sm" onClick={addCategory}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminContenido;
