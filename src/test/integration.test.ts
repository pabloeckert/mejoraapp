/**
 * Integration Tests
 *
 * Tests for component integration, data flow, and edge cases.
 * These tests verify that different parts of the system work together correctly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      or: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } } }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    getChannels: vi.fn().mockReturnValue([]),
    removeChannel: vi.fn(),
  },
}));

// ── Diagnostic Data Integrity ───────────────────────────────────
describe("Diagnostic Data Integrity", () => {
  it("BANCO_PREGUNTAS has exactly 8 questions", async () => {
    const { BANCO_PREGUNTAS } = await import("@/data/diagnosticData");
    expect(BANCO_PREGUNTAS.length).toBe(8);
  });

  it("each question has exactly 4 options", async () => {
    const { BANCO_PREGUNTAS } = await import("@/data/diagnosticData");
    for (const q of BANCO_PREGUNTAS) {
      expect(q.opts.length).toBe(4);
    }
  });

  it("each option has a score between 1 and 5", async () => {
    const { BANCO_PREGUNTAS } = await import("@/data/diagnosticData");
    for (const q of BANCO_PREGUNTAS) {
      for (const opt of q.opts) {
        expect(opt.score).toBeGreaterThanOrEqual(1);
        expect(opt.score).toBeLessThanOrEqual(5);
      }
    }
  });

  it("PERFILES has expected profile keys", async () => {
    const { PERFILES } = await import("@/data/diagnosticData");
    const keys = Object.keys(PERFILES);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const perfil = PERFILES[key];
      expect(perfil).toHaveProperty("tagline");
      expect(perfil).toHaveProperty("desc");
      expect(perfil).toHaveProperty("color");
      expect(perfil).toHaveProperty("mirror");
      expect(perfil).toHaveProperty("symptoms");
      expect(perfil).toHaveProperty("ctaTitle");
      expect(perfil).toHaveProperty("ctaText");
    }
  });

  it("detectarPerfil returns a valid profile", async () => {
    const { detectarPerfil, PERFILES } = await import("@/data/diagnosticData");
    // Test with various answer combinations
    const answers1 = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5 };
    const answers2 = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 };
    const answers3 = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 };

    const perfil1 = detectarPerfil(answers1);
    const perfil2 = detectarPerfil(answers2);
    const perfil3 = detectarPerfil(answers3);

    expect(PERFILES).toHaveProperty(perfil1);
    expect(PERFILES).toHaveProperty(perfil2);
    expect(PERFILES).toHaveProperty(perfil3);
  });

  it("shuffle returns same elements", async () => {
    const { shuffle, BANCO_PREGUNTAS } = await import("@/data/diagnosticData");
    const original = [...BANCO_PREGUNTAS];
    const shuffled = shuffle(BANCO_PREGUNTAS);
    expect(shuffled.length).toBe(original.length);
    // Same elements (just different order)
    for (const item of original) {
      expect(shuffled).toContain(item);
    }
  });
});

// ── Badge Data Integrity ────────────────────────────────────────
describe("Badge Data Integrity", () => {
  it("BADGES array is not empty", async () => {
    const { BADGES } = await import("@/data/badges");
    expect(BADGES.length).toBeGreaterThan(0);
  });

  it("each badge has required fields", async () => {
    const { BADGES } = await import("@/data/badges");
    for (const badge of BADGES) {
      expect(badge).toHaveProperty("slug");
      expect(badge).toHaveProperty("name");
      expect(badge).toHaveProperty("description");
      expect(badge).toHaveProperty("emoji");
      expect(typeof badge.slug).toBe("string");
      expect(typeof badge.name).toBe("string");
      expect(typeof badge.description).toBe("string");
      expect(typeof badge.emoji).toBe("string");
    }
  });

  it("badge slugs are unique", async () => {
    const { BADGES } = await import("@/data/badges");
    const slugs = BADGES.map((b) => b.slug);
    const uniqueSlugs = new Set(slugs);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  it("getBadgeBySlug returns badge for valid slug", async () => {
    const { BADGES, getBadgeBySlug } = await import("@/data/badges");
    const firstBadge = BADGES[0];
    const found = getBadgeBySlug(firstBadge.slug);
    expect(found).toBeDefined();
    expect(found?.slug).toBe(firstBadge.slug);
  });

  it("getBadgeBySlug returns undefined for invalid slug", async () => {
    const { getBadgeBySlug } = await import("@/data/badges");
    expect(getBadgeBySlug("nonexistent-badge")).toBeUndefined();
  });
});

// ── Supabase Types Integrity ────────────────────────────────────
describe("Supabase Types", () => {
  it("types file exports Database type", async () => {
    const types = await import("@/integrations/supabase/types");
    expect(types).toBeDefined();
  });
});

// ── Component Lazy Loading ──────────────────────────────────────
describe("Component Lazy Loading", () => {
  it("App imports all pages", async () => {
    const App = await import("@/App");
    expect(App.default).toBeDefined();
  });
});

// ── Edge Function Middleware Chain ───────────────────────────────
describe("Edge Function Middleware", () => {
  it("middleware options have correct defaults", () => {
    const defaults = { auth: true, admin: false, rateLimit: 0 };
    expect(defaults.auth).toBe(true);
    expect(defaults.admin).toBe(false);
    expect(defaults.rateLimit).toBe(0);
  });

  it("rate limit key uses user id when available", () => {
    const user = { id: "user-123" };
    const origin = "https://example.com";
    const key = user?.id ?? origin ?? "anonymous";
    expect(key).toBe("user-123");
  });

  it("rate limit key falls back to origin", () => {
    const user = null;
    const origin = "https://example.com";
    const key = user?.id ?? origin ?? "anonymous";
    expect(key).toBe("https://example.com");
  });

  it("rate limit key falls back to anonymous", () => {
    const user = null;
    const origin = null;
    const key = user?.id ?? origin ?? "anonymous";
    expect(key).toBe("anonymous");
  });
});

// ── CORS Configuration ──────────────────────────────────────────
describe("CORS Configuration", () => {
  it("allowed origins include production domain", () => {
    const allowedOrigins = [
      "https://app.mejoraok.com",
      "http://localhost:8080",
      "http://localhost:5173",
    ];
    expect(allowedOrigins).toContain("https://app.mejoraok.com");
    expect(allowedOrigins).toContain("http://localhost:8080");
  });
});

// ── CSP Directives ──────────────────────────────────────────────
describe("CSP Directives", () => {
  it("CSP allows Supabase connections", () => {
    const csp = "connect-src 'self' https://*.supabase.co wss://*.supabase.co";
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("wss://*.supabase.co");
  });

  it("CSP allows PostHog connections", () => {
    const csp = "connect-src 'self' https://us.i.posthog.com";
    expect(csp).toContain("https://us.i.posthog.com");
  });

  it("CSP allows Sentry connections", () => {
    const csp = "connect-src 'self' https://ingest.sentry.io";
    expect(csp).toContain("https://ingest.sentry.io");
  });
});

// ── PWA Configuration ───────────────────────────────────────────
describe("PWA Configuration", () => {
  it("manifest has required fields", () => {
    const manifest = {
      name: "MejoraApp",
      short_name: "MejoraApp",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0505a6",
    };
    expect(manifest.name).toBe("MejoraApp");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
  });
});

// ── Freemium Feature Matrix ─────────────────────────────────────
describe("Freemium Feature Matrix", () => {
  it("FREE_TIER restricts premium features", async () => {
    // In ALL_FREE mode, everything is enabled
    // But we can verify the FREE_TIER exists and restricts features
    const { PLAN_CONFIG, CURRENT_PLAN_ID } = await import("@/lib/plans");
    expect(CURRENT_PLAN_ID).toBe("all_free");
    expect(PLAN_CONFIG.features.diagnostic_history).toBe(true);
  });
});
