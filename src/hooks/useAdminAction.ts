import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para ejecutar acciones admin via Edge Function (server-side).
 * Todas las operaciones de escritura pasan por admin-action para
 * que la verificación de rol sea server-side, no client-side.
 */
export function useAdminAction() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async <T = { success: boolean }>(
      action: string,
      params: Record<string, unknown> = {}
    ): Promise<T> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("admin-action", {
          body: { action, ...params },
        });

        if (error) {
          throw new Error(error.message || "Error en operación admin");
        }

        return data as T;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { execute, loading };
}
