import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai";
import type { AIProviderConfig } from "@/services/ai";
import { CheckCircle, XCircle, ExternalLink, Loader2, Sparkles, Key } from "lucide-react";

const AdminIA = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    const all = aiService.getProviders();
    setProviders(all);
    const savedKeys: Record<string, string> = {};
    all.forEach((p) => {
      const key = p.getKey();
      if (key) savedKeys[p.name] = key;
    });
    setKeys(savedKeys);
  }, []);

  const handleSaveKey = (provider: AIProviderConfig) => {
    const key = keys[provider.name]?.trim();
    if (!key) {
      toast({ title: "Ingresá una API key", variant: "destructive" });
      return;
    }
    provider.setKey(key);
    toast({ title: `${provider.label} configurado ✅` });
  };

  const handleTest = async (provider: AIProviderConfig) => {
    setTesting(provider.name);
    try {
      // Temporarily set this as the only configured provider for the test
      const { content } = await aiService.chat(
        "Respondé en una sola oración corta.",
        "Decí 'Funcionando correctamente' en español."
      );
      toast({ title: `${provider.label}`, description: `Respuesta: ${content.slice(0, 80)}...` });
    } catch (err) {
      toast({
        title: `Error con ${provider.label}`,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const handleClearKey = (provider: AIProviderConfig) => {
    provider.setKey("");
    setKeys((prev) => ({ ...prev, [provider.name]: "" }));
    toast({ title: `${provider.label} eliminado` });
  };

  const configured = aiService.getConfiguredProviders();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Configuración de IA</h2>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>¿Cómo funciona?</strong> Cargá al menos una API key gratuita. La app rota automáticamente entre los proveedores disponibles.
            Si uno falla (rate limit), pasa al siguiente.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {configured.length > 0
              ? `${configured.length} proveedor(es) configurado(s): ${configured.map((p) => p.label).join(", ")}`
              : "⚠️ Ningún proveedor configurado. La generación de contenido y moderación no funcionarán."}
          </p>
        </CardContent>
      </Card>

      {providers.map((provider) => {
        const isConfigured = !!keys[provider.name];
        return (
          <Card key={provider.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {isConfigured ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  {provider.label}
                </CardTitle>
                <a
                  href={provider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Obtener key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">{provider.description}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs sr-only">API Key</Label>
                  <Input
                    type="password"
                    placeholder={`Pegá tu API key de ${provider.label.split("(")[0].trim()}...`}
                    value={keys[provider.name] || ""}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [provider.name]: e.target.value }))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveKey(provider)} disabled={!keys[provider.name]?.trim()}>
                  <Key className="w-3 h-3 mr-1" />
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTest(provider)}
                  disabled={!isConfigured || testing === provider.name}
                >
                  {testing === provider.name ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Test
                </Button>
                {isConfigured && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleClearKey(provider)}>
                    Quitar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p><strong>¿Cómo obtener las keys?</strong></p>
          <p>• <strong>Gemini:</strong> aistudio.google.com/apikey → Create API Key → Gratis, sin tarjeta</p>
          <p>• <strong>OpenRouter:</strong> openrouter.ai/settings/keys → Create Key → Gratis con límite diario</p>
          <p>• <strong>Groq:</strong> console.groq.com/keys → Create API Key → Gratis, ultra rápido</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIA;
