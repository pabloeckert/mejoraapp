/**
 * PostHog Analytics — MejoraApp
 *
 * Tracking de eventos clave para medir engagement y funnel.
 * Solo se activa en producción/staging (nunca en development local).
 *
 * Eventos custom:
 *  - login, signup, logout
 *  - publish_post, like_post, comment_post, delete_post
 *  - start_diagnostic, complete_diagnostic, share_diagnostic_wa
 *  - view_content, search_content
 *  - admin_action
 *  - onboarding_complete, profile_complete
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
const ENVIRONMENT = import.meta.env.MODE === "production" ? "production" : import.meta.env.VITE_ENVIRONMENT || "development";

let posthog: typeof import("posthog-js").default | null = null;

/**
 * Check if user has given cookie consent.
 * Returns true if accepted, false if rejected or not yet decided.
 */
function hasConsent(): boolean {
  try {
    return localStorage.getItem("mc-cookie-consent") === "accepted";
  } catch {
    return false;
  }
}

/**
 * Initialize PostHog. Call once at app startup.
 * In development, it logs events to console instead of sending them.
 * Respects cookie consent (Ley 25.326).
 */
export async function initAnalytics() {
  if (ENVIRONMENT === "development" && !import.meta.env.VITE_ANALYTICS_DEBUG) {
    console.info("[Analytics] Development mode — events will be logged to console");
    return;
  }

  if (!POSTHOG_KEY) {
    console.info("[Analytics] No PostHog key configured — analytics disabled");
    return;
  }

  // Respect cookie consent — don't initialize if user rejected
  if (!hasConsent()) {
    console.info("[Analytics] Cookie consent not given — analytics disabled");
    return;
  }

  try {
    const mod = await import("posthog-js");
    posthog = mod.default;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // We do manual pageviews
      capture_pageleave: true,
      autocapture: false, // We track specific events only
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        if (ENVIRONMENT !== "production") {
          ph.opt_out_capturing(); // Don't send in staging unless forced
        }
      },
    });

    console.info(`[Analytics] PostHog initialized — env: ${ENVIRONMENT}`);
  } catch (err) {
    console.warn("[Analytics] Failed to load PostHog:", err);
  }
}

// ─── Event Tracking ───────────────────────────────────────────────────────────

type EventProperties = Record<string, string | number | boolean | null | undefined>;

function track(event: string, properties?: EventProperties) {
  if (ENVIRONMENT === "development" && !import.meta.env.VITE_ANALYTICS_DEBUG) {
    console.debug(`[Analytics] ${event}`, properties);
    return;
  }

  if (!posthog) return;

  // Clean undefined values
  const clean = properties
    ? Object.fromEntries(Object.entries(properties).filter(([, v]) => v !== undefined))
    : {};

  posthog.capture(event, clean);
}

// ─── Page Views ───────────────────────────────────────────────────────────────

export function trackPageView(page: string, properties?: EventProperties) {
  track("$pageview", { $current_url: page, ...properties });
}

// ─── Auth Events ──────────────────────────────────────────────────────────────

export function trackLogin(method: "email" | "google" | "admin") {
  track("login", { method });
}

export function trackSignup(method: "email" | "google") {
  track("signup", { method });
}

export function trackLogout() {
  track("logout");
}

// ─── User Identification ──────────────────────────────────────────────────────

export function identifyUser(userId: string, traits?: EventProperties) {
  if (!posthog) return;
  posthog.identify(userId, traits);
}

export function resetUser() {
  if (!posthog) return;
  posthog.reset();
}

// ─── Muro Events ──────────────────────────────────────────────────────────────

export function trackPublishPost(charCount: number) {
  track("publish_post", { char_count: charCount });
}

export function trackLikePost(postId: string) {
  track("like_post", { post_id: postId });
}

export function trackCommentPost(postId: string, charCount: number) {
  track("comment_post", { post_id: postId, char_count: charCount });
}

export function trackDeletePost(postId: string) {
  track("delete_post", { post_id: postId });
}

// ─── Diagnóstico Events ──────────────────────────────────────────────────────

export function trackStartDiagnostic() {
  track("start_diagnostic");
}

export function trackCompleteDiagnostic(score: number, profile: string) {
  track("complete_diagnostic", { score, profile });
}

export function trackShareDiagnosticWA(score: number) {
  track("share_diagnostic_whatsapp", { score });
}

export function trackRetakeDiagnostic(attempt: number) {
  track("retake_diagnostic", { attempt });
}

// ─── Contenido Events ─────────────────────────────────────────────────────────

export function trackViewContent(contentId: string, category: string, contentType: string) {
  track("view_content", { content_id: contentId, category, content_type: contentType });
}

export function trackSearchContent(query: string, resultCount: number) {
  track("search_content", { query, result_count: resultCount });
}

export function trackFilterCategory(category: string) {
  track("filter_category", { category });
}

// ─── Admin Events ─────────────────────────────────────────────────────────────

export function trackAdminAction(action: string, target?: string) {
  track("admin_action", { action, target });
}

// ─── Onboarding / Profile ────────────────────────────────────────────────────

export function trackOnboardingComplete() {
  track("onboarding_complete");
}

export function trackOnboardingSkip(step: number) {
  track("onboarding_skip", { step });
}

export function trackProfileComplete(hasWhatsApp: boolean) {
  track("profile_complete", { has_whatsapp: hasWhatsApp });
}

export function trackProfileSkip() {
  track("profile_skip");
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export function trackTabSwitch(from: string, to: string) {
  track("tab_switch", { from_tab: from, to_tab: to });
}

export function trackCrossNavigation(from: string, to: string) {
  track("cross_navigation", { from, to });
}

// ─── Gamification ─────────────────────────────────────────────────────

export function trackBadgeEarned(badgeSlug: string) {
  track("badge_earned", { badge_slug: badgeSlug });
}

export function trackRankingViewed(position: number) {
  track("ranking_viewed", { position });
}

export function trackProfileViewed() {
  track("profile_viewed");
}

export function trackProfileEdited(field: string) {
  track("profile_edited", { field });
}

// ─── Services & Funnel ────────────────────────────────────────────────

export function trackServiceClick(serviceId: string) {
  track("service_click", { service_id: serviceId });
}

export function trackServiceWhatsApp() {
  track("service_whatsapp_click");
}

export function trackDiagnosticCTAPerfil(perfil: string, puntaje: number) {
  track("diagnostic_cta_perfil", { perfil, puntaje });
}

export function trackDiagnosticPDFExport(perfil: string) {
  track("diagnostic_pdf_export", { perfil });
}

export function trackContentRecommendationClick(contentId: string, perfil: string) {
  track("content_recommendation_click", { content_id: contentId, perfil });
}

export function trackFunnelStep(step: string, data?: Record<string, string | number | boolean>) {
  track("funnel_step", { step, ...data });
}
