/**
 * UpgradeModal — Modal overlay for premium upgrade prompts
 *
 * Shows when a user interacts with a premium-gated feature.
 * Displays feature details, benefits, and upgrade CTA.
 */

import { Lock, Sparkles, X, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trackUpgradeCTAClick } from "@/lib/analytics";
import { PLAN_CONFIG, PREMIUM_FEATURES, FEATURE_LABELS, type FeatureId } from "@/lib/plans";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The specific feature that triggered the modal */
  featureId?: FeatureId;
  /** Feature title to display */
  title?: string;
  /** Feature description to display */
  description?: string;
}

const PREMIUM_BENEFITS = [
  "Diagnósticos ilimitados con historial completo",
  "Exportá tus resultados a PDF profesional",
  "Recomendaciones personalizadas por IA",
  "Contenido exclusivo y workshops",
  "Directorio de la comunidad",
  "Soporte prioritario",
];

export function UpgradeModal({
  open,
  onOpenChange,
  featureId,
  title,
  description,
}: UpgradeModalProps) {
  if (!open) return null;

  const featureTitle = title ?? (featureId ? FEATURE_LABELS[featureId]?.title : "Función Premium");
  const featureDesc = description ?? (featureId ? FEATURE_LABELS[featureId]?.description : "");

  const handleUpgradeClick = () => {
    const feature = featureId ?? "general";
    trackUpgradeCTAClick(feature, PLAN_CONFIG.id);
    // TODO: redirect to pricing page when defined
    // window.location.href = "/planes";
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md mx-auto shadow-2xl border-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-mc-dark-blue to-mc-dark-blue/80 px-6 pt-8 pb-6 text-center text-white">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Crown className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-lg font-bold mb-1">Pasá a Premium</h2>
          <p className="text-sm opacity-80">
            Desbloqueá todo el potencial de MejoraApp
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Feature that triggered the modal */}
          {featureId && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">{featureTitle}</p>
                {featureDesc && (
                  <p className="text-xs text-muted-foreground mt-0.5">{featureDesc}</p>
                )}
              </div>
            </div>
          )}

          {/* Benefits list */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Con Premium tenés
            </h3>
            {PREMIUM_BENEFITS.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-mc-dark-blue to-mc-dark-blue/90 hover:from-mc-dark-blue/90 hover:to-mc-dark-blue text-white py-3 gap-2 font-bold"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade a Premium
            </Button>
            <p className="text-caption text-center text-muted-foreground">
              Cancelá cuando quieras. Sin compromiso.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
