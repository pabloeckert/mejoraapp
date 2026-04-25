/**
 * useFeatureAccess — Hook para verificar acceso a features premium
 *
 * Retorna si el usuario tiene acceso a un feature y helpers
 * para tracking de intentos bloqueados.
 *
 * Uso:
 *   const { hasAccess, trackBlocked } = useFeatureAccess("diagnostic_history");
 *   if (!hasAccess) trackBlocked();
 */

import { useCallback } from "react";
import { hasFeature, type FeatureId, FEATURE_LABELS, PLAN_CONFIG } from "@/lib/plans";
import { trackFunnelStep } from "@/lib/analytics";

export function useFeatureAccess(featureId: FeatureId) {
  const hasAccess = hasFeature(featureId);

  const trackBlocked = useCallback(() => {
    trackFunnelStep("feature_blocked", {
      feature: featureId,
      plan: PLAN_CONFIG.id,
    });
  }, [featureId]);

  const trackUpgradePromptShown = useCallback(() => {
    trackFunnelStep("upgrade_prompt_shown", {
      feature: featureId,
      plan: PLAN_CONFIG.id,
    });
  }, [featureId]);

  const info = FEATURE_LABELS[featureId];

  return {
    hasAccess,
    trackBlocked,
    trackUpgradePromptShown,
    featureTitle: info?.title ?? featureId,
    featureDescription: info?.description ?? "",
  };
}
