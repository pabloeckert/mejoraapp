/**
 * useAccessLevel — Hook para nivel de acceso del usuario
 *
 * Obtiene el access_level (N0/N1/N2/ADMIN) del perfil del usuario
 * y provee helpers para verificar acceso a features.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AccessLevel = Database["public"]["Enums"]["access_level"];

/** Orden jerárquico de niveles — mayor número = más acceso */
const LEVEL_HIERARCHY: Record<AccessLevel, number> = {
  N0: 0,
  N1: 1,
  N2: 2,
  ADMIN: 3,
};

interface AccessLevelData {
  access_level: AccessLevel;
  nickname: string | null;
  membership_expires_at: string | null;
}

async function fetchAccessLevel(userId: string): Promise<AccessLevelData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("access_level, nickname, membership_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return {
    access_level: (data?.access_level as AccessLevel) ?? "N0",
    nickname: data?.nickname ?? null,
    membership_expires_at: data?.membership_expires_at ?? null,
  };
}

export function useAccessLevel(userId: string | undefined) {
  const query = useQuery({
    queryKey: ["access-level", userId],
    queryFn: () => fetchAccessLevel(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });

  const level = query.data?.access_level ?? "N0";
  const levelNumber = LEVEL_HIERARCHY[level];

  /** ¿El usuario tiene al menos este nivel? */
  const hasAccess = (required: AccessLevel): boolean => {
    return levelNumber >= LEVEL_HIERARCHY[required];
  };

  /** ¿El usuario es admin? */
  const isAdmin = level === "ADMIN";

  /** ¿La membresía está vencida? (solo para N1/N2) */
  const isExpired = (() => {
    if (!query.data?.membership_expires_at) return false;
    if (level === "N0" || level === "ADMIN") return false;
    return new Date(query.data.membership_expires_at) < new Date();
  })();

  return {
    ...query,
    level,
    levelNumber,
    hasAccess,
    isAdmin,
    isExpired,
    nickname: query.data?.nickname ?? null,
    membershipExpiresAt: query.data?.membership_expires_at ?? null,
  };
}
