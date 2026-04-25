/**
 * UpgradePrompt — Componente para mostrar cuando un feature premium está bloqueado
 *
 * Muestra un card inline con el beneficio del feature + CTA.
 * No bloquea la navegación — invita a upgrade.
 *
 * Variantes:
 *   - "inline"  → card compacto dentro del flujo
 *   - "banner"  → banner superior llamativo
 *   - "modal"   → overlay modal (futuro, para onboarding premium)
 */

import { cn } from "@/lib/utils";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackFunnelStep } from "@/lib/analytics";
import { PLAN_CONFIG } from "@/lib/plans";

interface UpgradePromptProps {
  title: string;
  description: string;
  featureId: string;
  variant?: "inline" | "banner";
  className?: string;
}

export function UpgradePrompt({
  title,
  description,
  featureId,
  variant = "inline",
  className,
}: UpgradePromptProps) {
  const handleClick = () => {
    trackFunnelStep("upgrade_cta_click", {
      feature: featureId,
      plan: PLAN_CONFIG.id,
    });
    // TODO: cuando se defina el modelo de negocio, redirigir a página de planes
    // window.location.href = "/planes";
  };

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-mc-dark-blue/5 to-mc-red/5 border border-mc-dark-blue/10",
          className
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mc-dark-blue/10 flex items-center justify-center">
          <Lock className="w-4 h-4 text-mc-dark-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-subtitle font-semibold text-foreground truncate">{title}</p>
          <p className="text-body-sm text-muted-foreground line-clamp-1">{description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleClick}
          className="flex-shrink-0 border-mc-dark-blue/20 text-mc-dark-blue hover:bg-mc-dark-blue/5"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "border-dashed border-2 border-muted-foreground/20 bg-muted/30",
        className
      )}
    >
      <CardContent className="flex flex-col items-center text-center p-6 gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mc-dark-blue/10 to-mc-red/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-mc-dark-blue" />
        </div>
        <div>
          <h3 className="text-title font-semibold text-foreground">{title}</h3>
          <p className="text-body-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button
          onClick={handleClick}
          className="bg-mc-dark-blue hover:bg-mc-dark-blue/90 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Desbloquear
        </Button>
      </CardContent>
    </Card>
  );
}
