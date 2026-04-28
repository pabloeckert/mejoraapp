/**
 * Diagnostic Service — Business logic for Mirror/Strategic Diagnostic
 *
 * Centraliza: persistencia de resultados, progreso local, cálculos.
 * Los componentes solo renderizan; la lógica vive aquí.
 */

import { supabase } from "@/integrations/supabase/client";
import { BANCO_PREGUNTAS, shuffle, detectarPerfil, PERFILES } from "@/data/diagnosticData";
import type { DiagnosticQuestion } from "@/data/diagnosticData";

// ── Types ──────────────────────────────────────────────────────
export interface DiagnosticProgress {
  shuffledQuestions: DiagnosticQuestion[];
  currentIdx: number;
  answers: Record<number, number>;
  step: "intro" | "question" | "loading" | "result";
}

export interface DiagnosticHistoryEntry {
  id: string;
  perfil: string;
  puntaje_total: number;
  created_at: string;
}

export interface DiagnosticSaveResult {
  perfil: string;
  puntajeTotal: number;
}

// ── Constants ──────────────────────────────────────────────────
const STORAGE_KEY = "mc-diagnostic-progress";
const QUESTIONS_COUNT = 8;

// ── Progress Persistence ───────────────────────────────────────
export function loadProgress(): DiagnosticProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProgress(progress: DiagnosticProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or disabled — non-critical
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Question Management ────────────────────────────────────────
export function generateShuffledQuestions(): DiagnosticQuestion[] {
  return shuffle(BANCO_PREGUNTAS).map((q) => ({
    ...q,
    opts: shuffle(q.opts),
  }));
}

export function getProgressPercent(currentIdx: number): number {
  return Math.round((currentIdx / QUESTIONS_COUNT) * 100);
}

export function isLastQuestion(currentIdx: number): boolean {
  return currentIdx >= QUESTIONS_COUNT - 1;
}

// ── Result Calculation ─────────────────────────────────────────
export function calculateResult(answers: Record<number, number>): DiagnosticSaveResult {
  const perfil = detectarPerfil(answers);
  const puntajeTotal = Object.values(answers).reduce((a, b) => a + b, 0);
  return { perfil, puntajeTotal };
}

export function getPerfilData(perfil: string) {
  return PERFILES[perfil] ?? null;
}

export function generateWhatsAppLink(perfilData: { tagline: string }, waNumber: string): string {
  const waMsg = encodeURIComponent(
    `Hola, hice el Mirror de Mejora Continua. Mi Mirror es: "${perfilData.tagline}". Quiero hablar.`
  );
  return `https://wa.me/${waNumber}?text=${waMsg}`;
}

// ── Database Operations ────────────────────────────────────────
export async function fetchDiagnosticHistory(
  userId: string,
  limit: number = 3
): Promise<DiagnosticHistoryEntry[]> {
  const { data, error } = await supabase
    .from("diagnostic_results")
    .select("id, perfil, puntaje_total, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as DiagnosticHistoryEntry[]) ?? [];
}

export async function saveDiagnosticResult(
  userId: string,
  perfil: string,
  puntajeTotal: number,
  answers: Record<number, number>
): Promise<void> {
  const { error } = await supabase.from("diagnostic_results").insert({
    user_id: userId,
    perfil,
    puntaje_total: puntajeTotal,
    respuestas: answers,
  });
  if (error) throw error;

  // Mark profile as having completed diagnostic
  await supabase
    .from("profiles")
    .update({ has_completed_diagnostic: true })
    .eq("user_id", userId);
}

export function sendFollowUpEmail(userId: string, perfil: string, puntaje: number): void {
  supabase.functions
    .invoke("send-diagnostic-email", {
      body: { user_id: userId, perfil, puntaje },
    })
    .catch(() => {}); // Silent fail — email is best-effort
}
