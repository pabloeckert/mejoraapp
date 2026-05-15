/**
 * Business Mirror Gamer Service
 *
 * Centraliza: fetch de tests, guardado de resultados, historial.
 */

import { supabase as defaultSupabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ALL_TESTS,
  getTestBySlug,
  calculateProfile,
  type TestDefinition,
  type TestProfile,
} from "@/data/businessMirrorTests";

// ── Types ──────────────────────────────────────────────────────

export interface MirrorTestSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  category: string;
  icon: string;
  color: string;
  bg_color: string;
  min_access_level: string;
  game_type: string;
  time_estimate_min: number;
  sort_order: number;
}

export interface MirrorResult {
  id: string;
  user_id: string;
  test_id: string;
  answers: Record<number, number>;
  score: number | null;
  profile: string | null;
  profile_data: TestProfile | null;
  time_spent_seconds: number | null;
  completed_at: string;
}

// ── Fetch Tests ────────────────────────────────────────────────

/** Obtener tests disponibles desde Supabase */
export async function fetchAvailableTests(supabaseClient: SupabaseClient = defaultSupabase): Promise<MirrorTestSummary[]> {
  const { data, error } = await supabaseClient
    .from("business_mirror_tests")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as MirrorTestSummary[]) ?? [];
}

/** Obtener un test por slug (con questions completas) */
export async function fetchTestBySlug(slug: string, supabaseClient: SupabaseClient = defaultSupabase): Promise<TestDefinition | null> {
  // Primero intentamos desde los datos locales (más rápido, offline-first)
  const localTest = getTestBySlug(slug);
  if (localTest) return localTest;

  // Fallback a Supabase si no está en local
  const { data, error } = await supabaseClient
    .from("business_mirror_tests")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Mapear de Supabase a TestDefinition
  return {
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle ?? "",
    description: data.description ?? "",
    category: data.category,
    icon: data.icon ?? "Gamepad2",
    color: data.color ?? "#495F93",
    bgColor: data.bg_color ?? "bg-blue-50 dark:bg-blue-950/30",
    gameType: (data.game_type as TestDefinition["gameType"]) ?? "classic",
    timeEstimateMin: data.time_estimate_min ?? 5,
    questions: (data.questions as TestDefinition["questions"]) ?? [],
    scoringRules: [],
    profiles: (data.profiles as Record<string, TestProfile>) ?? {},
  };
}

// ── Save Results ───────────────────────────────────────────────

export async function saveMirrorResult(
  userId: string,
  testId: string,
  answers: Record<number, number>,
  profile: string,
  profileData: TestProfile,
  score: number,
  timeSpentSeconds: number,
  supabaseClient: SupabaseClient = defaultSupabase
): Promise<void> {
  const { error } = await supabaseClient.from("business_mirror_results").insert({
    user_id: userId,
    test_id: testId,
    answers,
    score,
    profile,
    profile_data: profileData,
    time_spent_seconds: timeSpentSeconds,
  });

  if (error) throw error;
}

// ── Fetch Results ──────────────────────────────────────────────

/** Obtener historial de resultados de un usuario */
export async function fetchMirrorResults(
  userId: string,
  limit: number = 10,
  supabaseClient: SupabaseClient = defaultSupabase
): Promise<MirrorResult[]> {
  const { data, error } = await supabaseClient
    .from("business_mirror_results")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as MirrorResult[]) ?? [];
}

/** Obtener el último resultado de un test específico */
export async function fetchLastResult(
  userId: string,
  testSlug: string,
  supabaseClient: SupabaseClient = defaultSupabase
): Promise<MirrorResult | null> {
  // Primero necesitamos el test_id
  const { data: testData } = await supabaseClient
    .from("business_mirror_tests")
    .select("id")
    .eq("slug", testSlug)
    .maybeSingle();

  if (!testData) return null;

  const { data, error } = await supabaseClient
    .from("business_mirror_results")
    .select("*")
    .eq("user_id", userId)
    .eq("test_id", testData.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as MirrorResult) ?? null;
}

// ── Scoring Helpers ────────────────────────────────────────────

export function computeScore(answers: Record<number, number>): number {
  return Object.values(answers).reduce((sum, v) => sum + v, 0);
}

export function getProfileForTest(
  test: TestDefinition,
  answers: Record<number, number>,
  totalTime?: number
): { key: string; data: TestProfile } | null {
  const key = calculateProfile(test, answers, totalTime);
  const data = test.profiles[key];
  if (!data) return null;
  return { key, data };
}

// ── Seed Data (for admin) ──────────────────────────────────────

/** Inserta los 5 tests en Supabase. Solo para admin/setup. */
export async function seedTests(supabaseClient: SupabaseClient = defaultSupabase): Promise<void> {
  for (let i = 0; i < ALL_TESTS.length; i++) {
    const test = ALL_TESTS[i];
    const { error } = await supabaseClient.from("business_mirror_tests").upsert(
      {
        slug: test.slug,
        title: test.title,
        subtitle: test.subtitle,
        description: test.description,
        category: test.category,
        icon: test.icon,
        color: test.color,
        bg_color: test.bgColor,
        min_access_level: "N1",
        game_type: test.gameType,
        time_estimate_min: test.timeEstimateMin,
        questions: test.questions,
        scoring_rules: test.scoringRules.map((r) => ({
          profileKey: r.profileKey,
        })),
        profiles: test.profiles,
        is_active: true,
        sort_order: i + 1,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`Error seeding test "${test.slug}":`, error);
      throw error;
    }
  }
}
