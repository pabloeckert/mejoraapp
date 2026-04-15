import { useState, useEffect } from "react";
import { Plus, Sparkles, Loader2, Trash2, Eye, EyeOff, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
}

interface Post {
  id: string;
  titulo: string;
  contenido: string;
  estado: string;
  fuente: string;
  published_at: string;
  category_id: string;
  content_categories?: { nombre: string } | null;
}

type View = "posts" | "new-post" | "ai-generate" | "categories" | "guidelines";

const AdminContenido = () => {
  const { toast } = useToast();
  const [view, setView] = useState<View>("posts");
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // New post form
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  // AI generate
  const [aiCategory, setAiCategory] = useState("");
  const [aiGuidelines, setAiGuidelines] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<{ titulo: string; contenido: string } | null>(null);

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
    if (postRes.data) setPosts(postRes.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const savePost = async (estado = "publicado") => {
    if (!titulo.trim() || !contenido.trim()) {
      toast({ title: "Completá título y contenido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("content_posts").insert({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      category_id: categoryId || null,
      estado,
      fuente: "admin",
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: estado === "publicado" ? "Publicado" : "Guardado como borrador" });
      setTitulo("");
      setContenido("");
      setCategoryId("");
      setView("posts");
      fetchData();
    }
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
        body: { category: cat?.slug || "tip", guidelines: aiGuidelines },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      setAiPreview({ titulo: data.titulo, contenido: data.contenido });
    } catch (err: any) {
      toast({ title: "Error al generar", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const publishAiContent = async () => {
    if (!aiPreview) return;
    setSaving(true);
    const { error } = await supabase.from("content_posts").insert({
      titulo: aiPreview.titulo,
      contenido: aiPreview.contenido,
      category_id: aiCategory || null,
      estado: "publicado",
      fuente: "ia",
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Publicado con IA" });
      setAiPreview(null);
      setAiGuidelines("");
      setView("posts");
      fetchData();
    }
  };

  const togglePostEstado = async (post: Post) => {
    const newEstado = post.estado === "publicado" ? "borrador" : "publicado";
    await supabase.from("content_posts").update({ estado: newEstado } as any).eq("id", post.id);
    fetchData();
  };

  const deletePost = async (id: string) => {
    await supabase.from("content_posts").delete().eq("id", id);
    fetchData();
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("content_categories").insert({ nombre: newCatName.trim(), slug } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewCatName("");
      setNewCatSlug("");
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
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

      {/* Posts list */}
      {view === "posts" && (
        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay publicaciones aún</p>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className={post.estado !== "publicado" ? "opacity-60" : ""}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {(post.content_categories as any)?.nombre || "Sin categoría"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {post.fuente === "ia" ? "🤖 IA" : "✍️ Manual"}
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
            ))
          )}
        </div>
      )}

      {/* New post form */}
      {view === "new-post" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Nueva publicación</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Título contundente" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <Textarea placeholder="Contenido..." rows={6} value={contenido} onChange={(e) => setContenido(e.target.value)} />
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

      {/* AI Generate */}
      {view === "ai-generate" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Generar contenido con IA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={aiCategory} onValueChange={setAiCategory}>
              <SelectTrigger><SelectValue placeholder="Categoría para generar" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Lineamientos adicionales para la IA (opcional). Ej: 'Enfocate en pymes de servicios', 'Usá un ejemplo de restaurante'..."
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

      {/* Categories */}
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
