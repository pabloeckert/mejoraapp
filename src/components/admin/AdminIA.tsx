import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, ExternalLink, Loader2, Sparkles, Server } from "lucide-react";

const AdminIA = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { category: "tip" },
      });

      if (error) throw error;

      if (data?.titulo) {
        toast({
          title: "IA funcionando ✅",
          description: `Generó: "${data.titulo.slice(0, 50)}..."`,
        });
      } else if (data?.error) {
        toast({ title: "Error de IA", description: data.error, variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Configuración de IA</h2>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>¿Cómo funciona?</strong> La IA se ejecuta 100% server-side (Edge Functions de Supabase).
            Las API keys se configuran como secrets en Supabase, nunca en el navegador.
          </p>
        </CardContent>
      </Card>

      {/* Server-side status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4" />
            Proveedores server-side
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Los proveedores se configuran como secrets en tu proyecto de Supabase.
            Las Edge Functions los usan automáticamente en este orden de prioridad:
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 py-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-medium">Gemini (Google)</span>
              <span className="text-caption text-muted-foreground ml-auto">GEMINI_API_KEY</span>
            </div>
            <div className="flex items-center gap-2 py-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-sm font-medium">Groq (Llama 3.3)</span>
              <span className="text-caption text-muted-foreground ml-auto">GROQ_API_KEY</span>
            </div>
            <div className="flex items-center gap-2 py-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-sm font-medium">OpenRouter (DeepSeek)</span>
              <span className="text-caption text-muted-foreground ml-auto">OPENROUTER_API_KEY</span>
            </div>
          </div>

          <Button onClick={handleTest} disabled={testing} className="w-full gap-2">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Probar IA
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cómo configurar los secrets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <ol className="space-y-2 list-decimal list-inside">
            <li>Andá a <a href="https://supabase.com/dashboard/project/pwiduojwgkaoxxuautkp/settings/functions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Supabase → Edge Functions Secrets <ExternalLink className="w-3 h-3" /></a></li>
            <li>Agregá al menos un secret: <code className="bg-muted px-1 rounded text-caption">GEMINI_API_KEY</code></li>
            <li>Obtené tu key gratis en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aistudio.google.com</a></li>
            <li>Guardá y probá con el botón de arriba</li>
          </ol>

          <div className="bg-muted/50 rounded-lg p-3 mt-2">
            <p className="font-medium text-foreground text-xs mb-1">¿Qué hace cada secret?</p>
            <p><code className="text-caption">GEMINI_API_KEY</code> — Moderación + generación de contenido (gratis, 15 req/min)</p>
            <p><code className="text-caption">GROQ_API_KEY</code> — Fallback ultra-rápido (gratis)</p>
            <p><code className="text-caption">OPENROUTER_API_KEY</code> — Fallback con DeepSeek (gratis con límite)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIA;
