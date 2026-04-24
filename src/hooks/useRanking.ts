/**
 * useRanking — Hook para ranking de comunidad
 *
 * Fetches top contributors from community_ranking view.
 * Respects anonymity: shows display_name but not user_id.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RankingEntry {
  user_id: string;
  display_name: string;
  empresa: string;
  post_count: number;
  comment_count: number;
  total_likes_received: number;
  activity_score: number;
  badge_count: number;
}

export function useRanking(limit: number = 10) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("community_ranking")
        .select("*")
        .limit(limit);

      if (error) {
        console.error("[Ranking] Error fetching:", error);
        // Fallback: compute manually
        await fetchRankingFallback();
        return;
      }

      setRanking(data ?? []);
      setLoading(false);
    };

    const fetchRankingFallback = async () => {
      // If view doesn't exist yet, compute from raw data
      const { data: posts } = await supabase
        .from("wall_posts")
        .select("user_id, likes_count")
        .eq("status", "approved");

      if (!posts) {
        setLoading(false);
        return;
      }

      // Aggregate by user
      const userStats: Record<string, { posts: number; likes: number }> = {};
      for (const post of posts) {
        if (!userStats[post.user_id]) {
          userStats[post.user_id] = { posts: 0, likes: 0 };
        }
        userStats[post.user_id].posts++;
        userStats[post.user_id].likes += post.likes_count || 0;
      }

      // Get profiles for display names
      const userIds = Object.keys(userStats);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, empresa")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      const entries: RankingEntry[] = userIds
        .map((uid) => {
          const stats = userStats[uid];
          const profile = profileMap.get(uid);
          return {
            user_id: uid,
            display_name: profile?.display_name || "Anónimo",
            empresa: profile?.empresa || "",
            post_count: stats.posts,
            comment_count: 0,
            total_likes_received: stats.likes,
            activity_score: stats.posts + stats.likes,
            badge_count: 0,
          };
        })
        .sort((a, b) => b.activity_score - a.activity_score)
        .slice(0, limit);

      setRanking(entries);
      setLoading(false);
    };

    fetchRanking();
  }, [limit]);

  return { ranking, loading };
}
