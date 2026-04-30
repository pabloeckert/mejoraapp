/**
 * useMembers — Hook for community member directory
 *
 * Fetches public profiles with stats for the Comunidad tab.
 * Supports filtering by industry and search by name.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityMember {
  id: string;
  nombre: string | null;
  apellido: string | null;
  display_name: string | null;
  empresa: string | null;
  cargo: string | null;
  bio: string | null;
  city: string | null;
  industry: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  badge_count: number;
  post_count: number;
  total_likes: number;
}

interface UseMembersOptions {
  limit?: number;
  industry?: string;
  search?: string;
  featured?: boolean;
}

export function useMembers(options: UseMembersOptions = {}) {
  const { limit = 20, industry, search, featured } = options;
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("public_profiles")
      .select("*", { count: "exact" })
      .order("badge_count", { ascending: false })
      .order("total_likes", { ascending: false });

    if (industry && industry !== "all") {
      query = query.eq("industry", industry);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `nombre.ilike.${term},apellido.ilike.${term},display_name.ilike.${term},empresa.ilike.${term}`
      );
    }

    if (featured) {
      query = query.limit(3);
    } else {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    } else {
      setMembers((data as CommunityMember[]) ?? []);
      setTotalCount(count ?? 0);
    }

    setLoading(false);
  }, [limit, industry, search, featured]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, totalCount, refetch: fetchMembers };
}

/**
 * useMemberProfile — Fetch a single member's public profile
 */
export function useMemberProfile(userId: string | null) {
  const [profile, setProfile] = useState<CommunityMember | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    supabase
      .from("public_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching member profile:", error);
          setProfile(null);
        } else {
          setProfile(data as CommunityMember);
        }
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading };
}

/**
 * useChallenges — Fetch active community challenges
 */
export interface CommunityChallenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  start_date: string;
  end_date: string;
  participant_count: number;
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("community_challenges")
        .select("*")
        .eq("is_active", true)
        .order("end_date", { ascending: true })
        .limit(3);

      if (error) {
        console.error("Error fetching challenges:", error);
      } else {
        setChallenges((data as CommunityChallenge[]) ?? []);
      }
      setLoading(false);
    };

    fetch();
  }, []);

  return { challenges, loading };
}

/**
 * useChallengeParticipation — Check if user joined a challenge
 */
export function useChallengeParticipation(challengeId: string, userId?: string) {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !challengeId) {
      setLoading(false);
      return;
    }

    supabase
      .from("challenge_participants")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setJoined(!!data);
        setLoading(false);
      });
  }, [challengeId, userId]);

  const toggleJoin = async () => {
    if (!userId) return;

    if (joined) {
      await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", userId);
      setJoined(false);
    } else {
      await supabase
        .from("challenge_participants")
        .insert({ challenge_id: challengeId, user_id: userId });
      setJoined(true);
    }
  };

  return { joined, loading, toggleJoin };
}
