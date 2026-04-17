import { describe, it, expect } from "vitest";
import { shuffle, detectarPerfil, PERFILES, BANCO_PREGUNTAS } from "../data/diagnosticData";

describe("shuffle", () => {
  it("should return same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it("should not mutate original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffle(input);
    expect(input).toEqual(original);
  });

  it("should handle empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("should handle single element", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe("detectarPerfil", () => {
  it("should return a valid profile key", () => {
    const validKeys = Object.keys(PERFILES);
    const answer = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 };
    const result = detectarPerfil(answer);
    expect(validKeys).toContain(result);
  });

  it("should detect SATURADO when v1 and v5 are low", () => {
    // No depende de mí + problemas se repiten
    const answer = { 1: 1, 2: 5, 3: 5, 4: 5, 5: 1, 6: 5, 7: 5, 8: 5 };
    const result = detectarPerfil(answer);
    expect(result).toBe("SATURADO");
  });

  it("should detect EQUIPO_DESALINEADO when v4 is low but operations are OK", () => {
    const answer = { 1: 4, 2: 4, 3: 4, 4: 1, 5: 4, 6: 4, 7: 4, 8: 3 };
    const result = detectarPerfil(answer);
    expect(result).toBe("EQUIPO_DESALINEADO");
  });

  it("should detect VENDEDOR_SIN_RESULTADOS when v2, v3, v8 are low", () => {
    const answer = { 1: 5, 2: 1, 3: 1, 4: 5, 5: 5, 6: 5, 7: 5, 8: 1 };
    const result = detectarPerfil(answer);
    expect(result).toBe("VENDEDOR_SIN_RESULTADOS");
  });

  it("should detect DESCONECTADO when v1 is high, v7 and v6 are low", () => {
    const answer = { 1: 5, 2: 4, 3: 4, 4: 4, 5: 4, 6: 1, 7: 1, 8: 3 };
    const result = detectarPerfil(answer);
    expect(result).toBe("DESCONECTADO");
  });

  it("should detect LIDER_SOLO when v7 is high, v1 and v4 are low", () => {
    const answer = { 1: 2, 2: 4, 3: 4, 4: 1, 5: 4, 6: 3, 7: 5, 8: 3 };
    const result = detectarPerfil(answer);
    expect(result).toBe("LIDER_SOLO");
  });

  it("should handle missing answers by defaulting to neutral (3)", () => {
    // Only answer questions 1 and 2
    const answer = { 1: 1, 2: 1 };
    const result = detectarPerfil(answer);
    expect(Object.keys(PERFILES)).toContain(result);
  });

  it("should handle empty answers", () => {
    const result = detectarPerfil({});
    expect(Object.keys(PERFILES)).toContain(result);
  });
});

describe("PERFILES", () => {
  it("should have all 8 profiles", () => {
    expect(Object.keys(PERFILES)).toHaveLength(8);
  });

  it("each profile should have required fields", () => {
    for (const [key, profile] of Object.entries(PERFILES)) {
      expect(profile.color).toBeTruthy();
      expect(profile.tagline).toBeTruthy();
      expect(profile.desc).toBeTruthy();
      expect(profile.mirror.length).toBeGreaterThan(0);
      expect(profile.symptoms.length).toBeGreaterThan(0);
      expect(profile.ctaTitle).toBeTruthy();
      expect(profile.ctaText).toBeTruthy();
    }
  });
});

describe("BANCO_PREGUNTAS", () => {
  it("should have exactly 8 questions", () => {
    expect(BANCO_PREGUNTAS).toHaveLength(8);
  });

  it("each question should have exactly 4 options", () => {
    for (const q of BANCO_PREGUNTAS) {
      expect(q.opts).toHaveLength(4);
    }
  });

  it("each question should have scores 1, 2, 3, 5", () => {
    for (const q of BANCO_PREGUNTAS) {
      const scores = q.opts.map((o) => o.score).sort();
      expect(scores).toEqual([1, 2, 3, 5]);
    }
  });

  it("each question should have id from 1 to 8", () => {
    const ids = BANCO_PREGUNTAS.map((q) => q.id).sort();
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
