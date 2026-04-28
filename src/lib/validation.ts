/**
 * Validation — Zod schemas for form validation
 *
 * Centraliza validaciones para todos los formularios del proyecto.
 * Usa zod para validación type-safe.
 *
 * Uso:
 *   import { loginSchema, signupSchema } from "@/lib/validation";
 *   const result = loginSchema.safeParse({ email, password });
 *   if (!result.success) { ... handle errors ... }
 */

import { z } from "zod";

// ── Auth Schemas ────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("El email no parece válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida"),
});

export const signupSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "Solo letras y espacios"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "Solo letras y espacios"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("El email no parece válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "Máximo 100 caracteres"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("El email no parece válido"),
});

// ── Profile Schemas ─────────────────────────────────────────────
export const profileEditSchema = z.object({
  bio: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("URL no válida")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("URL no válida")
    .optional()
    .or(z.literal("")),
});

export const adminProfileEditSchema = z.object({
  nombre: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  apellido: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  empresa: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  cargo: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email no válido")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
});

// ── Content Schemas ─────────────────────────────────────────────
export const wallPostSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido no puede estar vacío")
    .max(500, "Máximo 500 caracteres")
    .transform((s) => s.replace(/<[^>]*>/g, "").trim()), // Strip HTML
});

export const wallCommentSchema = z.object({
  content: z
    .string()
    .min(1, "El comentario no puede estar vacío")
    .max(300, "Máximo 300 caracteres")
    .transform((s) => s.replace(/<[^>]*>/g, "").trim()), // Strip HTML
});

export const contentPostSchema = z.object({
  titulo: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "Máximo 200 caracteres"),
  resumen: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  contenido: z
    .string()
    .min(1, "El contenido es requerido"),
  tipo_media: z
    .enum(["articulo", "video", "infografia", "pdf"]),
  categoria_id: z
    .string()
    .min(1, "La categoría es requerida"),
});

// ── CRM Schemas ─────────────────────────────────────────────────
export const crmClientSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  company: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  contact_name: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email no válido")
    .optional()
    .or(z.literal("")),
  whatsapp: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  segment: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export const crmProductSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  category: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .min(0, "El precio debe ser positivo")
    .optional(),
  currency: z
    .enum(["ARS", "USD", "EUR"]),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

// ── NPS Schema ──────────────────────────────────────────────────
export const npsSchema = z.object({
  score: z
    .number()
    .min(0, "Mínimo 0")
    .max(10, "Máximo 10"),
  feedback: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

// ── Utility Types ───────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
export type AdminProfileEditInput = z.infer<typeof adminProfileEditSchema>;
export type WallPostInput = z.infer<typeof wallPostSchema>;
export type WallCommentInput = z.infer<typeof wallCommentSchema>;
export type ContentPostInput = z.infer<typeof contentPostSchema>;
export type CRMClientInput = z.infer<typeof crmClientSchema>;
export type CRMProductInput = z.infer<typeof crmProductSchema>;
export type NPSInput = z.infer<typeof npsSchema>;

// ── Helper: Format Zod Errors ───────────────────────────────────
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join(". ");
}

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(formatZodError(result.error));
  }
  return result.data;
}
