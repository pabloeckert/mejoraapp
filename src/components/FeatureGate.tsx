/**
 * FeatureGate — Gate condicional para features premium
 *
 * Envuelve contenido premium. Si el usuario tiene acceso, renderiza children.
 * Si no, muestra el UpgradePrompt.
 *
 * Props:
 *   feature: FeatureId — qué feature verificar
 *   children: contenido premium a renderizar si tiene acceso
 *   fallback: contenido alternativo si no tiene acceso (opcional)
 *   variant: "inline" | "banner" — estilo del prompt (default: inline)
 */

import { type ReactNode } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface FeatureGateProps {
  feature: Parameters<typeof useFeatureAccess>[0];
  children: ReactNode;
  fallback?: ReactNode;
  variant?: "inline" | "banner";
}

export function FeatureGate({
  feature,
  children,
  fallback,
  variant = "inline",
}: FeatureGateProps) {
  const { hasAccess, featureTitle, featureDescription } = useFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      title={featureTitle}
      description={featureDescription}
      featureId={feature}
      variant={variant}
    />
  );
}
