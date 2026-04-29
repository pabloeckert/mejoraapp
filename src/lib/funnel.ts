/**
 * Funnel Tracking — MejoraApp NSM (North Star Metric)
 *
 * Tracks user progression through the activation funnel:
 * signup → onboarding_complete → first_visit → first_post → return_d1 → return_d7 → premium_intent
 *
 * Each step is tracked via PostHog with proper properties for cohort analysis.
 */

import { trackFunnelStep } from "./analytics";

// ── Funnel Step Definitions ──────────────────────────────────────────

export type FunnelStep =
  | "signup"
  | "onboarding_complete"
  | "first_visit"
  | "first_post"
  | "return_d1"
  | "return_d7"
  | "premium_intent";

interface FunnelStepMeta {
  step: FunnelStep;
  description: string;
  /** Whether this step requires authentication */
  requiresAuth: boolean;
}

export const FUNNEL_STEPS: FunnelStepMeta[] = [
  { step: "signup", description: "Usuario crea cuenta", requiresAuth: true },
  { step: "onboarding_complete", description: "Completa onboarding", requiresAuth: true },
  { step: "first_visit", description: "Primera visita post-onboarding", requiresAuth: true },
  { step: "first_post", description: "Primer post en el muro", requiresAuth: true },
  { step: "return_d1", description: "Retorna al día siguiente", requiresAuth: true },
  { step: "return_d7", description: "Retorna a los 7 días", requiresAuth: true },
  { step: "premium_intent", description: "Interactúa con feature premium", requiresAuth: true },
];

// ── Funnel Tracking Functions ────────────────────────────────────────

/**
 * Track when a user signs up (email or Google).
 */
export function trackSignupFunnel(method: "email" | "google"): void {
  trackFunnelStep("signup", { method, timestamp: Date.now() });
  setFunnelStage("signup");
}

/**
 * Track when a user completes onboarding.
 */
export function trackOnboardingCompleteFunnel(): void {
  trackFunnelStep("onboarding_complete", { timestamp: Date.now() });
  setFunnelStage("onboarding_complete");
}

/**
 * Track first visit after onboarding (app open with completed profile).
 */
export function trackFirstVisitFunnel(): void {
  const currentStage = getFunnelStage();
  // Only track if user hasn't already passed this stage
  if (!currentStage || getStepIndex(currentStage) < getStepIndex("first_visit")) {
    trackFunnelStep("first_visit", { timestamp: Date.now() });
    setFunnelStage("first_visit");
  }
}

/**
 * Track first post in the muro.
 */
export function trackFirstPostFunnel(): void {
  const currentStage = getFunnelStage();
  if (!currentStage || getStepIndex(currentStage) < getStepIndex("first_post")) {
    trackFunnelStep("first_post", { timestamp: Date.now() });
    setFunnelStage("first_post");
  }
}

/**
 * Track return visits (D1 = next day, D7 = 7 days later).
 */
export function trackReturnVisit(day: 1 | 7): void {
  const step: FunnelStep = day === 1 ? "return_d1" : "return_d7";
  const currentStage = getFunnelStage();
  if (!currentStage || getStepIndex(currentStage) < getStepIndex(step)) {
    trackFunnelStep(step, { day, timestamp: Date.now() });
    setFunnelStage(step);
  }
}

/**
 * Track premium feature intent (user clicks on gated feature).
 */
export function trackPremiumIntentFunnel(feature: string): void {
  trackFunnelStep("premium_intent", { feature, timestamp: Date.now() });
  setFunnelStage("premium_intent");
}

// ── Funnel Stage Persistence ─────────────────────────────────────────

const FUNNEL_STORAGE_KEY = "mc-funnel-stage";

function getStepIndex(step: FunnelStep): number {
  return FUNNEL_STEPS.findIndex((s) => s.step === step);
}

/**
 * Get the user's current funnel stage from localStorage.
 */
export function getFunnelStage(): FunnelStep | null {
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.stage ?? null;
  } catch {
    return null;
  }
}

/**
 * Set the user's funnel stage. Only advances forward, never goes back.
 */
export function setFunnelStage(stage: FunnelStep): void {
  try {
    const current = getFunnelStage();
    if (current && getStepIndex(current) >= getStepIndex(stage)) return;
    localStorage.setItem(
      FUNNEL_STORAGE_KEY,
      JSON.stringify({ stage, timestamp: Date.now() })
    );
  } catch {
    // ignore
  }
}

/**
 * Check if a user's signup was recent enough for D1/D7 return tracking.
 * Returns the signup timestamp or null.
 */
export function getSignupTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.timestamp ?? null;
  } catch {
    return null;
  }
}

/**
 * Hook-style function to check and track return visits.
 * Call this on app mount.
 */
export function checkReturnVisits(): void {
  const signupTs = getSignupTimestamp();
  if (!signupTs) return;

  const now = Date.now();
  const daysSinceSignup = (now - signupTs) / (1000 * 60 * 60 * 24);

  if (daysSinceSignup >= 1 && daysSinceSignup < 2) {
    trackReturnVisit(1);
  } else if (daysSinceSignup >= 7 && daysSinceSignup < 8) {
    trackReturnVisit(7);
  }
}
