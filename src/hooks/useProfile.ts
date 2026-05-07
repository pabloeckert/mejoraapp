/**
 * useProfile — Hook for user profile data with React Query caching
 *
 * Replaces direct Supabase calls in Index.tsx and other components.
 * Provides profile completeness check and profile data.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  empresa: string | null;
  cargo: string | null;
  phone: string | null;
  nombre: string | null;
  apellido: string | null;
  display_name: string | null;
  has_completed_diagnostic: boolean;
}

async function fetchProfile(userId: string): Promise<ProfileData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("empresa, cargo, phone, nombre, apellido, display_name, has_completed_diagnostic")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileData;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min — profile doesn't change often
    retry: 1,
  });
}

export function useProfileComplete(userId: string | undefined) {
  const { data, isLoading } = useProfile(userId);
  const isComplete = data ? !!(data.empresa || data.cargo) : null;
  return { isComplete, isLoading, profile: data };
}
