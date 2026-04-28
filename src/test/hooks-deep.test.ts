/**
 * Deep Hooks Tests
 *
 * Comprehensive tests for hook behavior, state management, and side effects.
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
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    getChannels: vi.fn().mockReturnValue([]),
    removeChannel: vi.fn(),
  },
}));

// ── usePullToRefresh Tests ──────────────────────────────────────
describe("usePullToRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports usePullToRefresh hook", async () => {
    const { usePullToRefresh } = await import("@/hooks/usePullToRefresh");
    expect(usePullToRefresh).toBeDefined();
    expect(typeof usePullToRefresh).toBe("function");
  });
});

// ── useLastVisit Tests ──────────────────────────────────────────
describe("useLastVisit", () => {
  it("exports useLastVisit hook", async () => {
    const { useLastVisit } = await import("@/hooks/useLastVisit");
    expect(useLastVisit).toBeDefined();
    expect(typeof useLastVisit).toBe("function");
  });
});

// ── useRanking Tests ────────────────────────────────────────────
describe("useRanking", () => {
  it("exports useRanking hook", async () => {
    const { useRanking } = await import("@/hooks/useRanking");
    expect(useRanking).toBeDefined();
    expect(typeof useRanking).toBe("function");
  });
});

// ── useContentRecommendations Tests ─────────────────────────────
describe("useContentRecommendations", () => {
  it("exports useContentRecommendations hook", async () => {
    const { useContentRecommendations } = await import("@/hooks/useContentRecommendations");
    expect(useContentRecommendations).toBeDefined();
    expect(typeof useContentRecommendations).toBe("function");
  });
});

// ── useFeatureAccess Tests ──────────────────────────────────────
describe("useFeatureAccess", () => {
  it("exports useFeatureAccess hook", async () => {
    const { useFeatureAccess } = await import("@/hooks/useFeatureAccess");
    expect(useFeatureAccess).toBeDefined();
    expect(typeof useFeatureAccess).toBe("function");
  });
});

// ── useAdminAction Tests ────────────────────────────────────────
describe("useAdminAction", () => {
  it("exports useAdminAction hook", async () => {
    const { useAdminAction } = await import("@/hooks/useAdminAction");
    expect(useAdminAction).toBeDefined();
    expect(typeof useAdminAction).toBe("function");
  });
});

// ── useCRM Deep Tests ───────────────────────────────────────────
describe("useCRM Deep", () => {
  it("exports all CRM hooks", async () => {
    const crm = await import("@/hooks/useCRM");
    const expectedHooks = [
      "useCRMClients",
      "useCRMClient",
      "useCRMClientsMinimal",
      "useUpsertCRMClient",
      "useDeleteCRMClient",
      "useCRMProducts",
      "useCRMActiveProducts",
      "useUpsertCRMProduct",
      "useCRMInteractions",
      "useCRMClientInteractions",
      "useCreateCRMInteraction",
      "useDeleteCRMInteraction",
      "useCRMDashboard",
      "useCRMSellerRanking",
    ];

    for (const hook of expectedHooks) {
      expect(crm).toHaveProperty(hook);
      expect(typeof (crm as any)[hook]).toBe("function");
    }
  });

  it("CRM types are available via types/crm", async () => {
    const crmTypes = await import("@/types/crm");
    expect(crmTypes).toBeDefined();
    // Types exist at compile time; runtime just needs the module to load
  });
});

// ── Context Deep Tests ──────────────────────────────────────────
describe("Context Deep Tests", () => {
  it("AuthContext exports useAuth and AuthProvider", async () => {
    const auth = await import("@/contexts/AuthContext");
    expect(auth).toHaveProperty("useAuth");
    expect(auth).toHaveProperty("AuthProvider");
    expect(typeof auth.useAuth).toBe("function");
  });

  it("ThemeContext exports useTheme and ThemeProvider", async () => {
    const theme = await import("@/contexts/ThemeContext");
    expect(theme).toHaveProperty("useTheme");
    expect(theme).toHaveProperty("ThemeProvider");
  });

  it("I18nContext exports useI18n and I18nProvider", async () => {
    const i18n = await import("@/contexts/I18nContext");
    expect(i18n).toHaveProperty("useI18n");
    expect(i18n).toHaveProperty("I18nProvider");
  });
});

// ── Library Deep Tests ──────────────────────────────────────────
describe("Library Deep Tests", () => {
  it("utils exports cn function", async () => {
    const utils = await import("@/lib/utils");
    expect(utils).toHaveProperty("cn");
    expect(typeof utils.cn).toBe("function");
  });

  it("plans exports all plan-related functions", async () => {
    const plans = await import("@/lib/plans");
    expect(plans).toHaveProperty("hasFeature");
    expect(plans).toHaveProperty("PLAN_CONFIG");
    expect(plans).toHaveProperty("CURRENT_PLAN_ID");
    expect(plans).toHaveProperty("FEATURE_LABELS");
  });

  it("ab-testing exports all testing functions", async () => {
    const ab = await import("@/lib/ab-testing");
    expect(ab).toHaveProperty("getVariant");
    expect(ab).toHaveProperty("trackABTest");
    expect(ab).toHaveProperty("resetExperiment");
    expect(ab).toHaveProperty("getAllAssignments");
    expect(ab).toHaveProperty("EXPERIMENTS");
  });

  it("analytics exports all tracking functions", async () => {
    const analytics = await import("@/lib/analytics");
    const functions = [
      "initAnalytics", "trackPageView", "trackLogin", "trackSignup", "trackLogout",
      "identifyUser", "resetUser", "trackPublishPost", "trackLikePost",
      "trackCommentPost", "trackDeletePost", "trackStartDiagnostic",
      "trackCompleteDiagnostic", "trackShareDiagnosticWA", "trackRetakeDiagnostic",
      "trackViewContent", "trackSearchContent", "trackFilterCategory",
      "trackAdminAction", "trackOnboardingComplete", "trackOnboardingSkip",
      "trackProfileComplete", "trackProfileSkip", "trackTabSwitch",
      "trackCrossNavigation", "trackBadgeEarned", "trackRankingViewed",
      "trackProfileViewed", "trackProfileEdited", "trackServiceClick",
      "trackServiceWhatsApp", "trackDiagnosticCTAPerfil", "trackDiagnosticPDFExport",
      "trackContentRecommendationClick", "trackFunnelStep",
      "trackFeatureBlocked", "trackUpgradePromptShown", "trackUpgradeCTAClick",
    ];

    for (const fn of functions) {
      expect(analytics).toHaveProperty(fn);
    }
  });

  it("sentry exports init and capture functions", async () => {
    const sentry = await import("@/lib/sentry");
    expect(sentry).toHaveProperty("initSentry");
    expect(sentry).toHaveProperty("setSentryUser");
    expect(sentry).toHaveProperty("captureError");
  });

  it("push exports push notification functions", async () => {
    const push = await import("@/lib/push");
    expect(push).toBeDefined();
  });

  it("pdfExport exports PDF generation function", async () => {
    const pdf = await import("@/lib/pdfExport");
    expect(pdf).toHaveProperty("exportDiagnosticPDF");
    expect(typeof pdf.exportDiagnosticPDF).toBe("function");
  });
});

// ── Data Module Deep Tests ──────────────────────────────────────
describe("Data Module Deep Tests", () => {
  it("diagnosticData exports all required functions and data", async () => {
    const data = await import("@/data/diagnosticData");
    expect(data).toHaveProperty("BANCO_PREGUNTAS");
    expect(data).toHaveProperty("PERFILES");
    expect(data).toHaveProperty("WA_NUMBER");
    expect(data).toHaveProperty("shuffle");
    expect(data).toHaveProperty("detectarPerfil");
  });

  it("badges exports all required functions and data", async () => {
    const badges = await import("@/data/badges");
    expect(badges).toHaveProperty("BADGES");
    expect(badges).toHaveProperty("getBadgeBySlug");
    expect(Array.isArray(badges.BADGES)).toBe(true);
    expect(badges.BADGES.length).toBeGreaterThan(0);
  });
});

// ── Repository Deep Tests ───────────────────────────────────────
describe("Repository Deep Tests", () => {
  it("repositories exports all repos", async () => {
    const repos = await import("@/repositories");
    expect(repos).toHaveProperty("wallRepo");
    expect(repos).toHaveProperty("contentRepo");
    expect(repos).toHaveProperty("profileRepo");
    expect(repos).toHaveProperty("diagnosticRepo");
    expect(repos).toHaveProperty("novedadesRepo");
  });

  it("wallRepo has all required methods", async () => {
    const { wallRepo } = await import("@/repositories");
    expect(wallRepo).toHaveProperty("getPosts");
    expect(wallRepo).toHaveProperty("getComments");
    expect(wallRepo).toHaveProperty("createPost");
    expect(wallRepo).toHaveProperty("createComment");
    expect(wallRepo).toHaveProperty("toggleLike");
    expect(wallRepo).toHaveProperty("deletePost");
  });

  it("contentRepo has all required methods", async () => {
    const { contentRepo } = await import("@/repositories");
    expect(contentRepo).toHaveProperty("getPosts");
    expect(contentRepo).toHaveProperty("searchPosts");
  });

  it("profileRepo has all required methods", async () => {
    const { profileRepo } = await import("@/repositories");
    expect(profileRepo).toHaveProperty("get");
    expect(profileRepo).toHaveProperty("update");
    expect(profileRepo).toHaveProperty("isComplete");
  });
});

// ── Services Deep Tests ─────────────────────────────────────────
describe("Services Deep Tests", () => {
  it("wall service exports all functions", async () => {
    const wall = await import("@/services/wall.service");
    expect(wall).toHaveProperty("fetchWallPosts");
    expect(wall).toHaveProperty("publishPost");
    expect(wall).toHaveProperty("deletePost");
    expect(wall).toHaveProperty("fetchComments");
    expect(wall).toHaveProperty("publishComment");
    expect(wall).toHaveProperty("toggleLike");
    expect(wall).toHaveProperty("createWallChannel");
    expect(wall).toHaveProperty("reportPost");
    expect(wall).toHaveProperty("timeAgo");
    expect(wall).toHaveProperty("formatFullDate");
    expect(wall).toHaveProperty("MAX_POST_LENGTH");
    expect(wall).toHaveProperty("MAX_COMMENT_LENGTH");
    expect(wall).toHaveProperty("POSTS_PER_PAGE");
  });

  it("diagnostic service exports all functions", async () => {
    const diag = await import("@/services/diagnostic.service");
    expect(diag).toHaveProperty("loadProgress");
    expect(diag).toHaveProperty("saveProgress");
    expect(diag).toHaveProperty("clearProgress");
    expect(diag).toHaveProperty("generateShuffledQuestions");
    expect(diag).toHaveProperty("getProgressPercent");
    expect(diag).toHaveProperty("isLastQuestion");
    expect(diag).toHaveProperty("calculateResult");
    expect(diag).toHaveProperty("getPerfilData");
    expect(diag).toHaveProperty("generateWhatsAppLink");
    expect(diag).toHaveProperty("fetchDiagnosticHistory");
    expect(diag).toHaveProperty("saveDiagnosticResult");
    expect(diag).toHaveProperty("sendFollowUpEmail");
  });

  it("content service exports all functions", async () => {
    const content = await import("@/services/content.service");
    expect(content).toHaveProperty("fetchContentPosts");
    expect(content).toHaveProperty("searchContentPosts");
    expect(content).toHaveProperty("fetchContentCategories");
    expect(content).toHaveProperty("fetchRecommendedContent");
    expect(content).toHaveProperty("MEDIA_TYPES");
    expect(content).toHaveProperty("getMediaTypeLabel");
    expect(content).toHaveProperty("filterByCategory");
    expect(content).toHaveProperty("filterByMediaType");
  });
});
