/** Shared types and storage helpers for Diagnostic components */

import type { DiagnosticQuestion } from "@/data/diagnosticData";

export type Step = "intro" | "question" | "loading" | "result";

export interface DiagnosticProgress {
  shuffledQuestions: DiagnosticQuestion[];
  currentIdx: number;
  answers: Record<number, number>;
  step: Step;
}

export interface DiagnosticHistoryEntry {
  id: string;
  perfil: string;
  puntaje_total: number;
  created_at: string;
}

const STORAGE_KEY = "mc-diagnostic-progress";

export const loadProgress = (): DiagnosticProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveProgress = (progress: DiagnosticProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or disabled — non-critical
  }
};

export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
