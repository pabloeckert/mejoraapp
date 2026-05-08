/**
 * useMirrorResults — Hook para resultados del Business Mirror Gamer
 */

import { useQuery } from "@tanstack/react-query";
import { fetchMirrorResults, type MirrorResult } from "@/services/business-mirror.service";

export function useMirrorResults(userId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ["mirror-results", userId, limit],
    queryFn: () => fetchMirrorResults(userId!, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
