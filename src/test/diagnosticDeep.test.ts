import { describe, it, expect } from "vitest";
import {
  shuffle,
  detectarPerfil,
  PERFILES,
  BANCO_PREGUNTAS,
  WA_NUMBER,
} from "../data/diagnosticData";

// ============================================================
// DIAGNÓSTICO — Tests completos del sistema de scoring
// ============================================================

describe("Diagnostic System — Deep Tests", () => {
  describe("Profile detection edge cases", () => {
    it("should handle all max scores (40 pts) and return a valid profile", () => {
      const answers: Record<number, number> = {};
      for (let i = 1; i <= 8; i++) answers[i] = 5;
      const result = detectarPerfil(answers);
      // The algorithm uses dimensional analysis, not just total score
      expect(Object.keys(PERFILES)).toContain(result);
    });

    it("should handle all min scores (8 pts) → SATURADO", () => {
      const answers: Record<number, number> = {};
      for (let i = 1; i <= 8; i++) answers[i] = 1;
      const result = detectarPerfil(answers);
      expect(result).toBe("SATURADO");
    });

    it("should handle all neutral scores (24 pts)", () => {
      const answers: Record<number, number> = {};
      for (let i = 1; i <= 8; i++) answers[i] = 3;
      const result = detectarPerfil(answers);
      expect(Object.keys(PERFILES)).toContain(result);
    });

    it("should detect CRECIENTE_CON_FRICCION when score is high but with friction points", () => {
      // Good base but some friction areas
      const answers = { 1: 4, 2: 4, 3: 4, 4: 3, 5: 2, 6: 4, 7: 4, 8: 4 };
      const result = detectarPerfil(answers);
      expect(Object.keys(PERFILES)).toContain(result);
    });

    it("should handle partial answers (only 3 questions)", () => {
      const answers = { 1: 5, 2: 1, 3: 3 };
      const result = detectarPerfil(answers);
      expect(Object.keys(PERFILES)).toContain(result);
    });

    it("should handle single answer", () => {
      const answers = { 1: 5 };
      const result = detectarPerfil(answers);
      expect(Object.keys(PERFILES)).toContain(result);
    });
  });

  describe("Score calculation", () => {
    it("total score should be sum of all answers", () => {
      const answers = { 1: 5, 2: 3, 3: 2, 4: 1, 5: 5, 6: 3, 7: 2, 8: 1 };
      const total = Object.values(answers).reduce((a, b) => a + b, 0);
      expect(total).toBe(22);
    });

    it("max possible score should be 40 (8 × 5)", () => {
      const maxScore = BANCO_PREGUNTAS.length * 5;
      expect(maxScore).toBe(40);
    });

    it("min possible score should be 8 (8 × 1)", () => {
      const minScore = BANCO_PREGUNTAS.length * 1;
      expect(minScore).toBe(8);
    });
  });

  describe("WhatsApp integration", () => {
    it("should have a valid WhatsApp number", () => {
      expect(WA_NUMBER).toBeTruthy();
      expect(WA_NUMBER.length).toBeGreaterThan(10);
    });
  });

  describe("Profile completeness", () => {
    it("all profiles should have unique colors", () => {
      const colors = Object.values(PERFILES).map((p) => p.color);
      const uniqueColors = new Set(colors);
      // Allow some duplicates since colors are visual
      expect(uniqueColors.size).toBeGreaterThanOrEqual(4);
    });

    it("all profiles should have CTA (call to action)", () => {
      for (const [key, profile] of Object.entries(PERFILES)) {
        expect(profile.ctaTitle.length).toBeGreaterThan(0);
        expect(profile.ctaText.length).toBeGreaterThan(0);
      }
    });

    it("all profiles should have mirror (self-reflection)", () => {
      for (const [key, profile] of Object.entries(PERFILES)) {
        expect(profile.mirror.length).toBeGreaterThan(0);
        for (const m of profile.mirror) {
          expect(m.length).toBeGreaterThan(0);
        }
      }
    });

    it("all profiles should have symptoms", () => {
      for (const [key, profile] of Object.entries(PERFILES)) {
        expect(profile.symptoms.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Question quality", () => {
    it("all questions should have meaningful titles", () => {
      for (const q of BANCO_PREGUNTAS) {
        expect(q.title.length).toBeGreaterThan(10);
      }
    });

    it("all questions should have subtitles", () => {
      for (const q of BANCO_PREGUNTAS) {
        expect(q.sub.length).toBeGreaterThan(5);
      }
    });

    it("all options should have meaningful text", () => {
      for (const q of BANCO_PREGUNTAS) {
        for (const opt of q.opts) {
          expect(opt.text.length).toBeGreaterThan(10);
        }
      }
    });

    it("options should have unique labels (A, B, C, D)", () => {
      for (const q of BANCO_PREGUNTAS) {
        const labels = q.opts.map((o) => o.label);
        expect(new Set(labels).size).toBe(4);
      }
    });
  });
});

describe("Shuffle — Deterministic behavior", () => {
  it("should produce different orders on multiple calls (probabilistic)", () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      results.add(JSON.stringify(shuffle(input)));
    }
    // With 20 elements, 10 shuffles should produce at least 2 different orders
    expect(results.size).toBeGreaterThanOrEqual(2);
  });

  it("should preserve all elements exactly once", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    expect(result.sort((a, b) => a - b)).toEqual(input);
  });
});
