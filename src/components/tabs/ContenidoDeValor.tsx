import { useState } from "react";
import { BookOpen, Lightbulb, FileText, Brain, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Category = "tip" | "articulo" | "reflexion";

interface ContentPiece {
  titulo: string;
  contenido: string;
  categoria: Category;
}

const CATEGORIES: { key: Category; label: string; icon: typeof Lightbulb; desc: string }[] = [
  { key: "tip", label: "Tip práctico", icon: Lightbulb, desc: "Algo que podés aplicar hoy" },
  { key: "articulo", label: "Estrategia", icon: FileText, desc: "Una idea para tu negocio" },
  { key: "reflexion", label: "Reflexión", icon: Brain, desc: "Para cuestionar cómo operás" },
];

const ContenidoDeValor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [content, setContent] = useState<ContentPiece | null>(null);
  const [history, setHistory] = useState<ContentPiece[]>([]);

  const generateContent = async (category: Category) => {
    setLoading(true);
    setSelectedCategory(category);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { category },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      const piece: ContentPiece = {
        titulo: data.titulo,
        contenido: data.contenido,
        categoria: data.categoria || category,
      };
      setContent(piece);
      setHistory((prev) => [piece, ...prev].slice(0, 10));
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error al generar contenido",
        description: "Intentá de nuevo en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryIcon = (cat: Category) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found ? found.icon : BookOpen;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Contenido de Valor</h1>
        <p className="text-sm text-muted-foreground">
          Artículos, tips y estrategias generados por IA, alineados con tu perfil.
        </p>
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIES.map(({ key, label, icon: Icon, desc }) => (
          <button
            key={key}
            onClick={() => generateContent(key)}
            disabled={loading}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center
              ${selectedCategory === key && !loading
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 bg-card"
              }
              ${loading ? "opacity-60 cursor-wait" : "cursor-pointer"}
            `}
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Generando contenido para vos...</p>
          </CardContent>
        </Card>
      )}

      {/* Content display */}
      {!loading && content && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const CatIcon = categoryIcon(content.categoria);
                  return <CatIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
                })()}
                <CardTitle className="text-base leading-snug">{content.titulo}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => generateContent(content.categoria)}
                title="Generar otro"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {content.contenido}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !content && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Elegí una categoría</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Seleccioná arriba qué tipo de contenido querés y lo generamos al instante con IA.
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Anteriores</h2>
          {history.slice(1).map((item, i) => {
            const HistIcon = categoryIcon(item.categoria);
            return (
              <Card
                key={i}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setContent(item)}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <HistIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{item.titulo}</span>
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
