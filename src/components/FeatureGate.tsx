/**
 * FeatureGate — Gate condicional para features premium
 *
 * Envuelve contenido premium. Si el usuario tiene acceso, renderiza children.
 * Si no, muestra el UpgradePrompt con tracking de eventos.
 *
 * Props:
 *   feature: FeatureId — qué feature verificar
 *   children: contenido premium a renderizar si tiene acceso
 *   fallback: contenido alternativo si no tiene acceso (opcional)
 *   variant: "inline" | "banner" — estilo del prompt (default: inline)
 */

import { type ReactNode } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useAccessLevel, type AccessLevel } from "@/hooks/useAccessLevel";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface FeatureGateProps {
  feature: Parameters<typeof useFeatureAccess>[0];
  children: ReactNode;
  fallback?: ReactNode;
  requiredLevel?: AccessLevel;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  requiredLevel = "N1",
}: FeatureGateProps) {
  const { hasAccess } = useFeatureAccess(feature);
  const { level } = useAccessLevel();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      currentLevel={level}
      requiredLevel={requiredLevel}
    />
  );
}
