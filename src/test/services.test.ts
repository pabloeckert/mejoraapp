/**
 * Services Layer Tests
 *
 * Tests for diagnostic, wall, and content service business logic.
 * Mocks Supabase client for unit testing.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
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

// Mock diagnostic data
vi.mock("@/data/diagnosticData", () => ({
  BANCO_PREGUNTAS: [
    { id: 1, title: "Q1", sub: "Sub1", opts: [{ text: "A", score: 5 }, { text: "B", score: 3 }] },
    { id: 2, title: "Q2", sub: "Sub2", opts: [{ text: "C", score: 5 }, { text: "D", score: 3 }] },
  ],
  PERFILES: {
    crecimiento: { tagline: "En crecimiento", desc: "Desc", color: "#000", mirror: ["M1"], symptoms: ["S1"], ctaTitle: "CTA", ctaText: "Text" },
  },
  WA_NUMBER: "5491112345678",
  shuffle: (arr: unknown[]) => [...arr],
  detectarPerfil: () => "crecimiento",
}));

// ── Diagnostic Service Tests ────────────────────────────────────
describe("Diagnostic Service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("loadProgress returns null when empty", async () => {
    const { loadProgress } = await import("@/services/diagnostic.service");
    expect(loadProgress()).toBeNull();
  });

  it("saveProgress and loadProgress roundtrip", async () => {
    const { saveProgress, loadProgress } = await import("@/services/diagnostic.service");
    const progress = {
      shuffledQuestions: [],
      currentIdx: 2,
      answers: { 1: 5 },
      step: "question" as const,
    };
    saveProgress(progress);
    const loaded = loadProgress();
    expect(loaded).toEqual(progress);
  });

  it("clearProgress removes saved data", async () => {
    const { saveProgress, loadProgress, clearProgress } = await import("@/services/diagnostic.service");
    saveProgress({ shuffledQuestions: [], currentIdx: 0, answers: {}, step: "question" });
    expect(loadProgress()).not.toBeNull();
    clearProgress();
    expect(loadProgress()).toBeNull();
  });

  it("calculateResult returns perfil and score", async () => {
    const { calculateResult } = await import("@/services/diagnostic.service");
    const result = calculateResult({ 1: 5, 2: 3 });
    expect(result.perfil).toBe("crecimiento");
    expect(result.puntajeTotal).toBe(8);
  });

  it("getPerfilData returns data for known perfil", async () => {
    const { getPerfilData } = await import("@/services/diagnostic.service");
    const data = getPerfilData("crecimiento");
    expect(data).not.toBeNull();
    expect(data?.tagline).toBe("En crecimiento");
  });

  it("getPerfilData returns null for unknown perfil", async () => {
    const { getPerfilData } = await import("@/services/diagnostic.service");
    expect(getPerfilData("unknown")).toBeNull();
  });

  it("generateWhatsAppLink creates valid wa.me link", async () => {
    const { generateWhatsAppLink } = await import("@/services/diagnostic.service");
    const link = generateWhatsAppLink({ tagline: "Test" }, "5491112345678");
    expect(link).toContain("wa.me/5491112345678");
    expect(link).toContain("Test");
  });

  it("getProgressPercent calculates correctly", async () => {
    const { getProgressPercent } = await import("@/services/diagnostic.service");
    expect(getProgressPercent(0)).toBe(0);
    expect(getProgressPercent(4)).toBe(50);
    expect(getProgressPercent(7)).toBe(88);
  });

  it("isLastQuestion returns true for index 7", async () => {
    const { isLastQuestion } = await import("@/services/diagnostic.service");
    expect(isLastQuestion(7)).toBe(true);
    expect(isLastQuestion(6)).toBe(false);
    expect(isLastQuestion(0)).toBe(false);
  });
});

// ── Wall Service Tests ──────────────────────────────────────────
describe("Wall Service", () => {
  it("MAX_POST_LENGTH is 500", async () => {
    const { MAX_POST_LENGTH } = await import("@/services/wall.service");
    expect(MAX_POST_LENGTH).toBe(500);
  });

  it("MAX_COMMENT_LENGTH is 300", async () => {
    const { MAX_COMMENT_LENGTH } = await import("@/services/wall.service");
    expect(MAX_COMMENT_LENGTH).toBe(300);
  });

  it("POSTS_PER_PAGE is 20", async () => {
    const { POSTS_PER_PAGE } = await import("@/services/wall.service");
    expect(POSTS_PER_PAGE).toBe(20);
  });

  it("timeAgo returns 'ahora' for recent dates", async () => {
    const { timeAgo } = await import("@/services/wall.service");
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("ahora");
  });

  it("timeAgo returns minutes for recent past", async () => {
    const { timeAgo } = await import("@/services/wall.service");
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("hace 5m");
  });

  it("timeAgo returns hours for older dates", async () => {
    const { timeAgo } = await import("@/services/wall.service");
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe("hace 3h");
  });

  it("timeAgo returns days for old dates", async () => {
    const { timeAgo } = await import("@/services/wall.service");
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("hace 2d");
  });

  it("formatFullDate returns formatted string", async () => {
    const { formatFullDate } = await import("@/services/wall.service");
    const date = "2026-04-29T12:00:00Z";
    const formatted = formatFullDate(date);
    expect(formatted).toContain("2026");
  });
});

// ── Content Service Tests ───────────────────────────────────────
describe("Content Service", () => {
  it("MEDIA_TYPES has expected keys", async () => {
    const { MEDIA_TYPES } = await import("@/services/content.service");
    expect(MEDIA_TYPES).toHaveProperty("articulo");
    expect(MEDIA_TYPES).toHaveProperty("video");
    expect(MEDIA_TYPES).toHaveProperty("infografia");
    expect(MEDIA_TYPES).toHaveProperty("pdf");
  });

  it("getMediaTypeLabel returns label for known type", async () => {
    const { getMediaTypeLabel } = await import("@/services/content.service");
    expect(getMediaTypeLabel("articulo")).toBe("Artículo");
    expect(getMediaTypeLabel("video")).toBe("Video");
  });

  it("getMediaTypeLabel returns raw string for unknown type", async () => {
    const { getMediaTypeLabel } = await import("@/services/content.service");
    expect(getMediaTypeLabel("podcast")).toBe("podcast");
  });

  it("filterByCategory returns all when null", async () => {
    const { filterByCategory } = await import("@/services/content.service");
    const posts = [
      { categoria_id: "1" },
      { categoria_id: "2" },
    ] as { categoria_id: string }[];
    expect(filterByCategory(posts, null)).toHaveLength(2);
  });

  it("filterByCategory filters correctly", async () => {
    const { filterByCategory } = await import("@/services/content.service");
    const posts = [
      { categoria_id: "1" },
      { categoria_id: "2" },
      { categoria_id: "1" },
    ] as { categoria_id: string }[];
    expect(filterByCategory(posts, "1")).toHaveLength(2);
    expect(filterByCategory(posts, "2")).toHaveLength(1);
  });

  it("filterByMediaType returns all when null", async () => {
    const { filterByMediaType } = await import("@/services/content.service");
    const posts = [
      { tipo_media: "articulo" },
      { tipo_media: "video" },
    ] as { tipo_media: string }[];
    expect(filterByMediaType(posts, null)).toHaveLength(2);
  });

  it("filterByMediaType filters correctly", async () => {
    const { filterByMediaType } = await import("@/services/content.service");
    const posts = [
      { tipo_media: "articulo" },
      { tipo_media: "video" },
      { tipo_media: "articulo" },
    ] as { tipo_media: string }[];
    expect(filterByMediaType(posts, "articulo")).toHaveLength(2);
    expect(filterByMediaType(posts, "video")).toHaveLength(1);
  });
});
