/**
 * Validation Tests
 *
 * Tests for zod validation schemas.
 */

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  profileEditSchema,
  wallPostSchema,
  wallCommentSchema,
  contentPostSchema,
  crmClientSchema,
  crmProductSchema,
  npsSchema,
  formatZodError,
  validateOrThrow,
} from "@/lib/validation";

// ── Login Schema ────────────────────────────────────────────────
describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

// ── Signup Schema ───────────────────────────────────────────────
describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects nombre with numbers", () => {
    const result = signupSchema.safeParse({
      nombre: "Juan123",
      apellido: "Pérez",
      email: "juan@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts nombre with accents", () => {
    const result = signupSchema.safeParse({
      nombre: "José María",
      apellido: "García López",
      email: "jose@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty fields", () => {
    const result = signupSchema.safeParse({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

// ── Reset Password Schema ───────────────────────────────────────
describe("resetPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = resetPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = resetPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ── Profile Edit Schema ─────────────────────────────────────────
describe("profileEditSchema", () => {
  it("accepts valid profile data", () => {
    const result = profileEditSchema.safeParse({
      bio: "Emprendedor apasionado",
      website: "https://example.com",
      linkedin: "https://linkedin.com/in/test",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty optional fields", () => {
    const result = profileEditSchema.safeParse({
      bio: "",
      website: "",
      linkedin: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects bio over 500 chars", () => {
    const result = profileEditSchema.safeParse({ bio: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL", () => {
    const result = profileEditSchema.safeParse({ website: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

// ── Wall Post Schema ────────────────────────────────────────────
describe("wallPostSchema", () => {
  it("accepts valid post content", () => {
    const result = wallPostSchema.safeParse({ content: "Mi negocio está creciendo" });
    expect(result.success).toBe(true);
  });

  it("strips HTML tags", () => {
    const result = wallPostSchema.safeParse({ content: "<b>texto</b>" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("texto");
    }
  });

  it("rejects empty content", () => {
    const result = wallPostSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects content over 500 chars", () => {
    const result = wallPostSchema.safeParse({ content: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("accepts content at exactly 500 chars", () => {
    const result = wallPostSchema.safeParse({ content: "a".repeat(500) });
    expect(result.success).toBe(true);
  });
});

// ── Wall Comment Schema ─────────────────────────────────────────
describe("wallCommentSchema", () => {
  it("accepts valid comment", () => {
    const result = wallCommentSchema.safeParse({ content: "Buen post!" });
    expect(result.success).toBe(true);
  });

  it("rejects empty comment", () => {
    const result = wallCommentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects comment over 300 chars", () => {
    const result = wallCommentSchema.safeParse({ content: "a".repeat(301) });
    expect(result.success).toBe(false);
  });

  it("strips HTML from comments", () => {
    const result = wallCommentSchema.safeParse({ content: "<script>alert('xss')</script>safe" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("alert('xss')safe");
    }
  });
});

// ── Content Post Schema ─────────────────────────────────────────
describe("contentPostSchema", () => {
  it("accepts valid content post", () => {
    const result = contentPostSchema.safeParse({
      titulo: "Cómo crecer tu negocio",
      resumen: "Tips para emprendedores",
      contenido: "Contenido completo del artículo...",
      tipo_media: "articulo",
      categoria_id: "cat-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing titulo", () => {
    const result = contentPostSchema.safeParse({
      titulo: "",
      contenido: "algo",
      tipo_media: "articulo",
      categoria_id: "cat-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tipo_media", () => {
    const result = contentPostSchema.safeParse({
      titulo: "Test",
      contenido: "algo",
      tipo_media: "podcast",
      categoria_id: "cat-123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid media types", () => {
    for (const tipo of ["articulo", "video", "infografia", "pdf"]) {
      const result = contentPostSchema.safeParse({
        titulo: "Test",
        contenido: "algo",
        tipo_media: tipo,
        categoria_id: "cat-123",
      });
      expect(result.success).toBe(true);
    }
  });
});

// ── CRM Client Schema ───────────────────────────────────────────
describe("crmClientSchema", () => {
  it("accepts valid client", () => {
    const result = crmClientSchema.safeParse({
      name: "Empresa ABC",
      company: "ABC SRL",
      email: "contacto@abc.com",
      whatsapp: "+5491112345678",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal client (only name)", () => {
    const result = crmClientSchema.safeParse({ name: "ABC" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = crmClientSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = crmClientSchema.safeParse({ name: "ABC", email: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ── CRM Product Schema ──────────────────────────────────────────
describe("crmProductSchema", () => {
  it("accepts valid product", () => {
    const result = crmProductSchema.safeParse({
      name: "Consultoría",
      price: 50000,
      currency: "ARS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = crmProductSchema.safeParse({
      name: "Test",
      price: -100,
      currency: "ARS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid currency", () => {
    const result = crmProductSchema.safeParse({
      name: "Test",
      currency: "BRL",
    });
    expect(result.success).toBe(false);
  });
});

// ── NPS Schema ──────────────────────────────────────────────────
describe("npsSchema", () => {
  it("accepts valid NPS score", () => {
    const result = npsSchema.safeParse({ score: 8 });
    expect(result.success).toBe(true);
  });

  it("accepts score 0", () => {
    const result = npsSchema.safeParse({ score: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts score 10", () => {
    const result = npsSchema.safeParse({ score: 10 });
    expect(result.success).toBe(true);
  });

  it("rejects score over 10", () => {
    const result = npsSchema.safeParse({ score: 11 });
    expect(result.success).toBe(false);
  });

  it("rejects negative score", () => {
    const result = npsSchema.safeParse({ score: -1 });
    expect(result.success).toBe(false);
  });
});

// ── Utility Functions ───────────────────────────────────────────
describe("formatZodError", () => {
  it("formats single error", () => {
    const result = loginSchema.safeParse({ email: "", password: "123" });
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    }
  });

  it("formats multiple errors", () => {
    const result = signupSchema.safeParse({
      nombre: "",
      apellido: "",
      email: "invalid",
      password: "12",
    });
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain(".");
    }
  });
});

describe("validateOrThrow", () => {
  it("returns data on success", () => {
    const data = validateOrThrow(loginSchema, {
      email: "test@example.com",
      password: "123456",
    });
    expect(data.email).toBe("test@example.com");
  });

  it("throws on failure", () => {
    expect(() => {
      validateOrThrow(loginSchema, { email: "", password: "" });
    }).toThrow();
  });
});
