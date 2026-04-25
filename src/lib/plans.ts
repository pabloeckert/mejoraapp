/**
 * Plans & Feature Flags — MejoraApp
 *
 * Define qué features son gratuitas vs premium.
 * Modo actual: ALL_FREE (todo habilitado, cero fricción).
 * Cuando se defina el modelo de negocio, cambiar PLAN_CONFIG a "free".
 *
 * Uso:
 *   import { hasFeature, PLAN_CONFIG } from "@/lib/plans";
 *   const canSeeHistory = hasFeature("diagnostic_history");
 */

// ── Feature IDs ────────────────────────────────────────────────
export type FeatureId =
  | "diagnostic_history"      // Historial ilimitado de diagnósticos
  | "diagnostic_pdf"          // Exportar diagnóstico a PDF
  | "diagnostic_evolution"    // Comparación de evolución entre diagnósticos
  | "content_recommendations" // Recomendaciones personalizadas por IA
  | "premium_content"         // Contenido exclusivo (artículos, workshops)
  | "community_directory"     // Directorio de miembros de la comunidad
  | "priority_support"        // CTA consultoría con prioridad
  | "advanced_analytics";     // Dashboards avanzados (admin)

// ── Plan Definitions ───────────────────────────────────────────
type PlanFeatures = Record<FeatureId, boolean>;

interface PlanConfig {
  id: string;
  name: string;
  features: PlanFeatures;
}

// ALL_FREE: todo habilitado — para lanzamiento sin fricción
const ALL_FREE: PlanFeatures = {
  diagnostic_history: true,
  diagnostic_pdf: true,
  diagnostic_evolution: true,
  content_recommendations: true,
  premium_content: true,
  community_directory: true,
  priority_support: true,
  advanced_analytics: true,
};

// FREE_TIER: features gratuitas — para activar cuando se defina el modelo
const FREE_TIER: PlanFeatures = {
  diagnostic_history: false,      // Solo 1 resultado guardado
  diagnostic_pdf: false,          // Requiere premium
  diagnostic_evolution: false,    // Requiere premium
  content_recommendations: false, // Sin recomendaciones IA
  premium_content: false,         // Solo contenido base
  community_directory: false,     // Requiere premium
  priority_support: false,        // Sin prioridad
  advanced_analytics: true,       // Admin siempre tiene analytics
};

// ── Current Plan ───────────────────────────────────────────────
// Cambiar a "free" cuando se defina el modelo de negocio
export const CURRENT_PLAN_ID = "all_free";

const PLANS: Record<string, PlanConfig> = {
  all_free: {
    id: "all_free",
    name: "All Free",
    features: ALL_FREE,
  },
  free: {
    id: "free",
    name: "Gratuito",
    features: FREE_TIER,
  },
};

export const PLAN_CONFIG = PLANS[CURRENT_PLAN_ID] ?? PLANS.all_free;

// ── Feature Check ──────────────────────────────────────────────
export function hasFeature(featureId: FeatureId): boolean {
  return PLAN_CONFIG.features[featureId] ?? false;
}

// ── Premium Feature Labels (for upgrade prompts) ───────────────
export const FEATURE_LABELS: Record<FeatureId, { title: string; description: string }> = {
  diagnostic_history: {
    title: "Historial de diagnósticos",
    description: "Guardá y compará tus resultados anteriores para ver tu evolución.",
  },
  diagnostic_pdf: {
    title: "Exportar a PDF",
    description: "Descargá tu diagnóstico como documento profesional para compartir.",
  },
  diagnostic_evolution: {
    title: "Evolución estratégica",
    description: "Compará tus resultados a lo largo del tiempo y medí tu progreso.",
  },
  content_recommendations: {
    title: "Contenido personalizado",
    description: "Recomendaciones inteligentes basadas en tu perfil y resultados.",
  },
  premium_content: {
    title: "Contenido exclusivo",
    description: "Accedé a artículos premium, workshops y materiales exclusivos.",
  },
  community_directory: {
    title: "Directorio de la comunidad",
    description: "Conectá con otros líderes empresariales de la comunidad.",
  },
  priority_support: {
    title: "Soporte prioritario",
    description: "Acceso directo a consultoría con prioridad de respuesta.",
  },
  advanced_analytics: {
    title: "Analytics avanzados",
    description: "Dashboards detallados y métricas de rendimiento.",
  },
};
