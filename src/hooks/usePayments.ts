/**
 * usePayments — Hook para historial de pagos del usuario
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Payment {
  id: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  payment_method: string | null;
  external_id: string | null;
  notes: string | null;
  created_at: string;
}

async function fetchPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, currency, status, payment_method, external_id, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data as Payment[]) ?? [];
}

export function usePayments(userId: string | undefined) {
  return useQuery({
    queryKey: ["payments", userId],
    queryFn: () => fetchPayments(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
