/** DiagnosticResultView — Results display with recommendations and CTAs */

import { MessageCircle, BookOpen, Download, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useContentRecommendations } from "@/hooks/useContentRecommendations";
import { FeatureGate } from "@/components/FeatureGate";
import { WA_NUMBER } from "@/data/diagnosticData";
import {
  trackShareDiagnosticWA,
  trackDiagnosticCTAPerfil,
  trackDiagnosticPDFExport,
  trackContentRecommendationClick,
  trackFunnelStep,
} from "@/lib/analytics";

// Lazy-load PDF export (heavy: jsPDF ~400KB)
const exportDiagnosticPDF = (...args: Parameters<typeof import("@/lib/pdfExport").exportDiagnosticPDF>) =>
  import("@/lib/pdfExport").then((m) => m.exportDiagnosticPDF(...args));

interface PerfilData {
  tagline: string;
  desc: string;
  color: string;
  mirror: string[];
  symptoms: string[];
  ctaTitle: string;
  ctaText: string;
}

interface DiagnosticResultViewProps {
  perfil: string;
  perfilData: PerfilData;
  puntaje: number;
  onComplete: () => void;
  userName?: string;
}

export const DiagnosticResultView = ({
  perfil,
  perfilData,
  puntaje,
  onComplete,
  userName,
}: DiagnosticResultViewProps) => {
  const { recommendations, loading: loadingRecs } = useContentRecommendations(perfil, 3);
  const { toast } = useToast();

  const waMsg = encodeURIComponent(
    `Hola, hice el Mirror de Mejora Continua. Mi Mirror es: "${perfilData.tagline}". Quiero hablar.`
  );
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  const handleExportPDF = async () => {
    try {
      await exportDiagnosticPDF({
        perfil,
        puntaje,
        respuestas: {},
        fecha: new Date().toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        userName,
      });
      trackDiagnosticPDFExport(perfil);
      toast({ title: "PDF descargado", description: "Tu Mirror se guardó como PDF." });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-5">
      <div
        className="text-title font-black text-center text-white py-5 px-5 rounded-xl leading-tight"
        style={{ backgroundColor: perfilData.color }}
      >
        {perfilData.tagline}
      </div>

      <div className="bg-secondary border-l-4 border-mc-diag-blue p-4 rounded-r-xl">
        <p className="text-sm text-foreground leading-relaxed">{perfilData.desc}</p>
      </div>

      <div>
        <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase mb-3">
          Lo que te dijiste esta semana
        </h3>
        <div className="space-y-2">
          {perfilData.mirror.map((m, i) => (
            <div
              key={i}
              className="py-2.5 px-4 bg-card border border-border rounded-r-xl italic text-sm text-foreground leading-relaxed"
              style={{ borderLeftWidth: 3, borderLeftColor: perfilData.color }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase mb-3">
          Lo que tu negocio está mostrando
        </h3>
        <div className="border border-border rounded-xl overflow-hidden">
          {perfilData.symptoms.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 p-3",
                i < perfilData.symptoms.length - 1 && "border-b border-border"
              )}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-caption font-bold flex-shrink-0 mt-0.5"
                style={{
                  borderWidth: 2,
                  borderColor: perfilData.color,
                  color: perfilData.color,
                  backgroundColor: `${perfilData.color}15`,
                }}
              >
                !
              </div>
              <span className="text-sm text-foreground leading-snug">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA de consultoría */}
      <div className="bg-mc-diag-blue rounded-xl p-6 text-center text-white">
        <h3 className="text-base font-extrabold mb-2">{perfilData.ctaTitle}</h3>
        <p className="text-xs opacity-80 mb-4 leading-relaxed">{perfilData.ctaText}</p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackShareDiagnosticWA(puntaje);
            trackDiagnosticCTAPerfil(perfil, puntaje);
            trackFunnelStep("diagnostic_whatsapp_cta", { perfil, puntaje });
          }}
          className="inline-flex items-center gap-2 bg-mc-diag-red hover:bg-mc-diag-red/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Quiero hablar con un especialista →
        </a>
      </div>

      {/* Recomendaciones de contenido */}
      <FeatureGate feature="content_recommendations" variant="inline">
        <div className="space-y-2">
          <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Contenido recomendado para tu perfil
          </h3>
          {loadingRecs ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => {
                    trackContentRecommendationClick(rec.id, perfil);
                    onComplete();
                  }}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {rec.titulo}
                      </p>
                      <p className="text-caption text-muted-foreground line-clamp-2 mt-0.5">
                        {rec.resumen || rec.contenido?.slice(0, 100)}
                      </p>
                      {rec.content_categories && (
                        <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {rec.content_categories.nombre}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </FeatureGate>

      {/* Action buttons */}
      <div className="flex gap-2">
        <FeatureGate
          feature="diagnostic_pdf"
          fallback={
            <Button
              onClick={onComplete}
              className="flex-1 bg-mc-dark-blue hover:bg-mc-dark-blue/90 text-white py-3 gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Ver contenido
            </Button>
          }
        >
          <Button onClick={handleExportPDF} variant="outline" className="flex-1 py-3 gap-2">
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </FeatureGate>
        <Button
          onClick={onComplete}
          className="flex-1 bg-mc-dark-blue hover:bg-mc-dark-blue/90 text-white py-3 gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Ver contenido
        </Button>
      </div>
    </div>
  );
};
