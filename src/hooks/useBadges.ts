/**
 * useBadges — Hook para badges del usuario actual
 *
 * Fetches badges from user_badges table.
 * Returns earned badges and all badge definitions.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BADGES, BadgeDefinition, getBadgeBySlug } from "@/data/badges";

interface UserBadge {
  badge_slug: string;
  earned_at: string;
}

export interface EarnedBadge extends BadgeDefinition {
  earned_at: string;
}

export function useBadges(userId: string | undefined) {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Realtime: subscribe to new badges
    // Channel name must be unique per user to avoid conflicts on re-subscribe
    const channelName = `user_badges_${userId}`;

    // Remove any stale channel with the same name before creating a new one
    const existing = supabase.getChannels().find((c) => c.topic === channelName);
    if (existing) supabase.removeChannel(existing);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_badges",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as UserBadge;
          const def = getBadgeBySlug(row.badge_slug);
          if (def) {
            setEarnedBadges((prev) => {
              if (prev.some((b) => b.slug === row.badge_slug)) return prev;
              return [...prev, { ...def, earned_at: row.earned_at }];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
