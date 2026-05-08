/**
 * UpgradePrompt — Prompt para subir de nivel de membresía
 *
 * Muestra CTA para upgrade con info del nivel requerido.
 * Intenta abrir checkout de Tiendup; fallback a WhatsApp.
 */

import { useState } from "react";
import { Lock, Crown, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { openCheckout } from "@/services/tiendup.service";
import type { AccessLevel } from "@/hooks/useAccessLevel";

interface UpgradePromptProps {
  currentLevel: AccessLevel;
  requiredLevel: AccessLevel;
  message?: string;
}

const LEVEL_INFO: Record<AccessLevel, { label: string; icon: typeof Lock; color: string; productEnvKey?: string }> = {
  N0: { label: "Gratis", icon: Lock, color: "text-muted-foreground" },
  N1: { label: "Básico", icon: Star, color: "text-blue-500", productEnvKey: "VITE_TIENDUP_PRODUCT_N1" },
  N2: { label: "Premium", icon: Crown, color: "text-amber-500", productEnvKey: "VITE_TIENDUP_PRODUCT_N2" },
  ADMIN: { label: "Admin", icon: Crown, color: "text-red-500" },
};

export function UpgradePrompt({ currentLevel, requiredLevel, message }: UpgradePromptProps) {
  const info = LEVEL_INFO[requiredLevel];
  const Icon = info.icon;
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    // Try Tiendup checkout first
    const productId = info.productEnvKey ? import.meta.env[info.productEnvKey] : undefined;

    if (productId) {
      setLoading(true);
      try {
        await openCheckout(productId);
        return;
      } catch (err) {
        console.warn("[UpgradePrompt] Tiendup checkout failed, falling back to WhatsApp:", err);
      } finally {
        setLoading(false);
      }
    }

    // Fallback: WhatsApp
    const text = encodeURIComponent(
      `Hola! Quiero upgrade a ${info.label} (${requiredLevel}). Mi nivel actual es ${currentLevel}.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center gap-4 py-8 px-6 text-center">
        <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${info.color}`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-lg">
            Contenido {info.label}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {message ?? `Necesitás nivel ${info.label} (${requiredLevel}) para acceder a esta sección.`}
          </p>
        </div>

        <Button onClick={handleUpgrade} className="gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Upgrade a {info.label}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Tu nivel actual: <span className="font-medium">{LEVEL_INFO[currentLevel].label}</span>
        </p>
      </CardContent>
    </Card>
  );
}
