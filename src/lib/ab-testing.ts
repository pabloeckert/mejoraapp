/**
 * A/B Testing — MejoraApp
 *
 * Sistema lightweight de A/B testing usando localStorage + PostHog.
 * Asigna variantes de forma determinística por usuario (hash del userId o random).
 *
 * Uso:
 *   import { getVariant, trackABTest } from "@/lib/ab-testing";
 *   const variant = getVariant("onboarding_v2");
 *   // variant: "control" | "variant_b"
 *   trackABTest("onboarding_v2", variant, "converted");
 */

const STORAGE_PREFIX = "mc_ab_";

// ── Experiment Definitions ─────────────────────────────────────
export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  /** Weight for each variant (default: equal). Index-matched to variants. */
  weights?: number[];
}

// Active experiments
export const EXPERIMENTS: Record<string, Experiment> = {
  onboarding_v2: {
    id: "onboarding_v2",
    name: "Onboarding V2 — Community-first",
    variants: ["control", "variant_b"],
    weights: [50, 50],
  },
};

// ── Variant Assignment ─────────────────────────────────────────

/**
 * Simple hash function for deterministic assignment.
 * Uses a basic djb2 hash on the seed string.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

/**
 * Get or assign a variant for an experiment.
 * Persists in localStorage so the user always sees the same variant.
 *
 * @param experimentId - The experiment ID from EXPERIMENTS
 * @param userId - Optional user ID for deterministic assignment. If not provided, uses random.
 * @returns The assigned variant name
 */
export function getVariant(experimentId: string, userId?: string): string {
  const experiment = EXPERIMENTS[experimentId];
  if (!experiment) {
    console.warn(`[AB] Unknown experiment: ${experimentId}`);
    return "control";
  }

  const storageKey = `${STORAGE_PREFIX}${experimentId}`;

  // Check if already assigned
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing && experiment.variants.includes(existing)) {
      return existing;
    }
  } catch {}

  // Assign variant
  let variant: string;

  if (userId) {
    // Deterministic: hash userId + experimentId
    const hash = hashString(`${userId}:${experimentId}`);
    const bucket = hash % 100;
    const weights = experiment.weights || experiment.variants.map(() => 100 / experiment.variants.length);

    let cumulative = 0;
    variant = experiment.variants[0]; // fallback
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += weights[i];
      if (bucket < cumulative) {
        variant = experiment.variants[i];
        break;
      }
    }
  } else {
    // Random assignment
    const weights = experiment.weights || experiment.variants.map(() => 100 / experiment.variants.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const rand = Math.random() * totalWeight;

    let cumulative = 0;
    variant = experiment.variants[0];
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        variant = experiment.variants[i];
        break;
      }
    }
  }

  // Persist
  try {
    localStorage.setItem(storageKey, variant);
  } catch {}

  return variant;
}

// ── Tracking ───────────────────────────────────────────────────

/**
 * Track an A/B test event via PostHog.
 * Sends as a custom event with experiment metadata.
 */
export function trackABTest(
  experimentId: string,
  variant: string,
  event: "assigned" | "viewed" | "converted" | "skipped",
  properties?: Record<string, string | number | boolean>
) {
  // Dynamic import to avoid circular deps
  import("@/lib/analytics").then(({ trackFunnelStep }) => {
    trackFunnelStep(`ab_${experimentId}_${event}`, {
      experiment_id: experimentId,
      variant,
      ...properties,
    });
  }).catch(() => {
    // Fallback: log to console in dev
    if (import.meta.env.DEV) {
      console.debug(`[AB] ${experimentId}/${variant}/${event}`, properties);
    }
  });
}

/**
 * Reset a specific experiment (for testing).
 */
export function resetExperiment(experimentId: string) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${experimentId}`);
  } catch {}
}

/**
 * Get all active experiment assignments for the current user.
 */
export function getAllAssignments(): Record<string, string> {
  const assignments: Record<string, string> = {};
  for (const exp of Object.values(EXPERIMENTS)) {
    const variant = getVariant(exp.id);
    assignments[exp.id] = variant;
  }
  return assignments;
}
