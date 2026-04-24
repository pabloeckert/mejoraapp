import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VISIT_KEY = "mc-last-visits";

interface LastVisits {
  contenido?: string; // ISO timestamp
  muro?: string;
  novedades?: string;
  diagnostico?: string;
}

function loadVisits(): LastVisits {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveVisits(visits: LastVisits) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(visits));
  } catch {
    // ignore
  }
}

/**
 * Track last visit timestamps per tab and detect new content.
 * Returns badges: which tabs have new content since last visit.
 */
export function useLastVisit() {
  const [badges, setBadges] = useState<Record<string, boolean>>({});
  const [visits] = useState<LastVisits>(loadVisits);

  // Check for new content on mount
  useEffect(() => {
    const checkNew = async () => {
      const result: Record<string, boolean> = {};

      // Check muro — new posts since last visit
      if (visits.muro) {
        const { count } = await supabase
          .from("wall_posts")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .gt("created_at", visits.muro);
        result.muro = (count ?? 0) > 0;
      }

      // Check contenido — new posts since last visit
      if (visits.contenido) {
        const { count } = await supabase
          .from("content_posts")
          .select("id", { count: "exact", head: true })
          .eq("estado", "publicado")
          .gt("published_at", visits.contenido);
        result.contenido = (count ?? 0) > 0;
      }

      // Check novedades — new novedades since last visit
      if (visits.novedades) {
        const { count } = await supabase
          .from("novedades")
          .select("id", { count: "exact", head: true })
          .gt("created_at", visits.novedades);
        result.novedades = (count ?? 0) > 0;
      }

      setBadges(result);
    };

    checkNew();
  }, [visits]);

  // Mark a tab as visited (call when user opens the tab)
  const markVisited = useCallback((tabId: string) => {
    const current = loadVisits();
    current[tabId as keyof LastVisits] = new Date().toISOString();
    saveVisits(current);
    setBadges((prev) => ({ ...prev, [tabId]: false }));
  }, []);

  return { badges, markVisited };
}
