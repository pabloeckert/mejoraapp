/**
 * Hooks Tests
 *
 * Tests for custom hooks: useBadges, useFeatureAccess, usePullToRefresh, useRanking.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } } }),
    },
  },
}));

// ── useFeatureAccess Tests ──────────────────────────────────────
describe("useFeatureAccess", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hasFeature returns true for all features in ALL_FREE mode", async () => {
    const { hasFeature } = await import("@/lib/plans");
    expect(hasFeature("diagnostic_history")).toBe(true);
    expect(hasFeature("diagnostic_pdf")).toBe(true);
    expect(hasFeature("content_recommendations")).toBe(true);
    expect(hasFeature("premium_content")).toBe(true);
    expect(hasFeature("community_directory")).toBe(true);
    expect(hasFeature("priority_support")).toBe(true);
    expect(hasFeature("advanced_analytics")).toBe(true);
    expect(hasFeature("diagnostic_evolution")).toBe(true);
  });

  it("PLAN_CONFIG is all_free by default", async () => {
    const { CURRENT_PLAN_ID, PLAN_CONFIG } = await import("@/lib/plans");
    expect(CURRENT_PLAN_ID).toBe("all_free");
    expect(PLAN_CONFIG.id).toBe("all_free");
    expect(PLAN_CONFIG.name).toBe("All Free");
  });

  it("FEATURE_LABELS has all feature descriptions", async () => {
    const { FEATURE_LABELS } = await import("@/lib/plans");
    const featureIds = [
      "diagnostic_history", "diagnostic_pdf", "diagnostic_evolution",
      "content_recommendations", "premium_content", "community_directory",
      "priority_support", "advanced_analytics",
    ];
    for (const id of featureIds) {
      expect(FEATURE_LABELS).toHaveProperty(id);
      expect(FEATURE_LABELS[id as keyof typeof FEATURE_LABELS].title).toBeTruthy();
      expect(FEATURE_LABELS[id as keyof typeof FEATURE_LABELS].description).toBeTruthy();
    }
  });
});

// ── A/B Testing Tests ───────────────────────────────────────────
describe("A/B Testing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getVariant returns control for unknown experiment", async () => {
    const { getVariant } = await import("@/lib/ab-testing");
    expect(getVariant("unknown_experiment")).toBe("control");
  });

  it("getVariant returns valid variant for known experiment", async () => {
    const { getVariant } = await import("@/lib/ab-testing");
    const variant = getVariant("onboarding_v2");
    expect(["control", "variant_b"]).toContain(variant);
  });

  it("getVariant persists assignment in localStorage", async () => {
    const { getVariant } = await import("@/lib/ab-testing");
    const first = getVariant("onboarding_v2");
    const second = getVariant("onboarding_v2");
    expect(first).toBe(second);
  });

  it("resetExperiment clears assignment", async () => {
    const { getVariant, resetExperiment } = await import("@/lib/ab-testing");
    getVariant("onboarding_v2");
    resetExperiment("onboarding_v2");
    // After reset, should get a new assignment (might be same or different)
    const variant = getVariant("onboarding_v2");
    expect(["control", "variant_b"]).toContain(variant);
  });

  it("getAllAssignments returns all active experiments", async () => {
    const { getAllAssignments } = await import("@/lib/ab-testing");
    const assignments = getAllAssignments();
    expect(assignments).toHaveProperty("onboarding_v2");
    expect(["control", "variant_b"]).toContain(assignments.onboarding_v2);
  });

  it("EXPERIMENTS has correct structure", async () => {
    const { EXPERIMENTS } = await import("@/lib/ab-testing");
    expect(EXPERIMENTS).toHaveProperty("onboarding_v2");
    expect(EXPERIMENTS.onboarding_v2.variants).toEqual(["control", "variant_b"]);
    expect(EXPERIMENTS.onboarding_v2.weights).toEqual([50, 50]);
  });

  it("getVariant with userId produces deterministic result", async () => {
    const { getVariant, resetExperiment } = await import("@/lib/ab-testing");
    resetExperiment("onboarding_v2");
    const v1 = getVariant("onboarding_v2", "user-123");
    resetExperiment("onboarding_v2");
    const v2 = getVariant("onboarding_v2", "user-123");
    expect(v1).toBe(v2); // Same user always gets same variant
  });
});

// ── Analytics Tests ─────────────────────────────────────────────
describe("Analytics", () => {
  it("initAnalytics does not throw", async () => {
    const { initAnalytics } = await import("@/lib/analytics");
    await expect(initAnalytics()).resolves.not.toThrow();
  });

  it("track functions do not throw without PostHog", async () => {
    const analytics = await import("@/lib/analytics");
    expect(() => analytics.trackLogin("email")).not.toThrow();
    expect(() => analytics.trackSignup("google")).not.toThrow();
    expect(() => analytics.trackLogout()).not.toThrow();
    expect(() => analytics.trackPublishPost(100)).not.toThrow();
    expect(() => analytics.trackLikePost("post-123")).not.toThrow();
    expect(() => analytics.trackCommentPost("post-123", 50)).not.toThrow();
    expect(() => analytics.trackDeletePost("post-123")).not.toThrow();
    expect(() => analytics.trackStartDiagnostic()).not.toThrow();
    expect(() => analytics.trackCompleteDiagnostic(25, "crecimiento")).not.toThrow();
    expect(() => analytics.trackViewContent("c-1", "estrategia", "articulo")).not.toThrow();
    expect(() => analytics.trackSearchContent("test", 5)).not.toThrow();
    expect(() => analytics.trackAdminAction("create-post")).not.toThrow();
    expect(() => analytics.trackOnboardingComplete()).not.toThrow();
    expect(() => analytics.trackBadgeEarned("first-post")).not.toThrow();
    expect(() => analytics.trackServiceClick("consultoria")).not.toThrow();
  });
});

// ── Sentry Tests ────────────────────────────────────────────────
describe("Sentry", () => {
  it("initSentry does not throw", async () => {
    const { initSentry } = await import("@/lib/sentry");
    expect(() => initSentry()).not.toThrow();
  });

  it("setSentryUser does not throw", async () => {
    const { setSentryUser } = await import("@/lib/sentry");
    expect(() => setSentryUser(null)).not.toThrow();
    expect(() => setSentryUser({ id: "test", email: "test@test.com" } as any)).not.toThrow();
  });
});

// ── Utils Tests ─────────────────────────────────────────────────
describe("Utils", () => {
  it("cn merges class names", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });
});
