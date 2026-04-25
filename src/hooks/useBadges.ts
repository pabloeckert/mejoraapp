/**
 * useBadges — Hook para badges del usuario actual
 *
 * Fetches badges from user_badges table.
 * Returns earned badges and all badge definitions.
 *
 * Uses a module-level channel cache to prevent duplicate Realtime
 * subscriptions when multiple components use this hook with the same userId.
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BADGES, BadgeDefinition, getBadgeBySlug } from "@/data/badges";

interface UserBadge {
  badge_slug: string;
  earned_at: string;
}

export interface EarnedBadge extends BadgeDefinition {
  earned_at: string;
}

// Module-level state shared across all hook instances for the same userId
const channelState = new Map<
  string,
  {
    channel: ReturnType<typeof supabase.channel>;
    refCount: number;
    subscribed: boolean;
  }
>();

function getOrCreateChannel(userId: string): {
  channel: ReturnType<typeof supabase.channel>;
  isNew: boolean;
} {
  const key = `user_badges_${userId}`;
  const cached = channelState.get(key);
  if (cached) {
    cached.refCount++;
    return { channel: cached.channel, isNew: false };
  }
  const channel = supabase.channel(key);
  channelState.set(key, { channel, refCount: 1, subscribed: false });
  return { channel, isNew: true };
}

function markSubscribed(userId: string) {
  const key = `user_badges_${userId}`;
  const cached = channelState.get(key);
  if (cached) cached.subscribed = true;
}

function releaseChannel(userId: string) {
  const key = `user_badges_${userId}`;
  const cached = channelState.get(key);
  if (!cached) return;
  cached.refCount--;
  if (cached.refCount <= 0) {
    supabase.removeChannel(cached.channel);
    channelState.delete(key);
  }
}

export function useBadges(userId: string | undefined) {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const callbackRef = useRef<((payload: { new: UserBadge }) => void) | null>(
    null
  );

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_slug, earned_at")
        .eq("user_id", userId)
        .order("earned_at", { ascending: true });

      if (error) {
        console.error("[Badges] Error fetching:", error);
        setLoading(false);
        return;
      }

      const earned: EarnedBadge[] = (data ?? [])
        .map((row: UserBadge) => {
          const def = getBadgeBySlug(row.badge_slug);
          if (!def) return null;
          return { ...def, earned_at: row.earned_at };
        })
        .filter(Boolean) as EarnedBadge[];

      setEarnedBadges(earned);
      setLoading(false);
    };

    fetchBadges();

    // Store callback so badge updates work across all hook instances
    callbackRef.current = (payload: { new: UserBadge }) => {
      const row = payload.new;
      const def = getBadgeBySlug(row.badge_slug);
      if (def) {
        setEarnedBadges((prev) => {
          if (prev.some((b) => b.slug === row.badge_slug)) return prev;
          return [...prev, { ...def, earned_at: row.earned_at }];
        });
      }
    };

    // Get or create shared channel — NEVER creates duplicates
    const { channel, isNew } = getOrCreateChannel(userId);

    if (isNew) {
      // First instance: attach handler and subscribe
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_badges",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbackRef.current?.(payload as { new: UserBadge });
        }
      );
      channel.subscribe();
      markSubscribed(userId);
    }
    // else: another hook instance already subscribed — skip entirely

    return () => {
      releaseChannel(userId);
    };
  }, [userId]);

  const hasBadge = (slug: string) => earnedBadges.some((b) => b.slug === slug);

  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));
  const unearnedBadges = BADGES.filter((b) => !earnedSlugs.has(b.slug));

  return {
    earnedBadges,
    unearnedBadges,
    loading,
    hasBadge,
    totalEarned: earnedBadges.length,
    totalAvailable: BADGES.length,
  };
}
