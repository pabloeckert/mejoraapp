import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============================================================
// CRM HOOKS — Solo para uso en panel admin
// ============================================================

// --- Types ---
export interface CRMClient {
  id: string;
  name: string;
  company: string | null;
  contact_name: string | null;
  segment: string | null;
  location: string | null;
  province: string | null;
  address: string | null;
  whatsapp: string | null;
  email: string | null;
  channel: string | null;
  first_contact_date: string | null;
  status: "activo" | "potencial" | "inactivo";
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMProduct {
  id: string;
  name: string;
  category: string | null;
  price: number | null;
  unit: string;
  unit_label: string;
  currency: "ARS" | "USD" | "EUR";
  description: string | null;
  active: boolean;
  created_at: string;
}

export interface CRMInteraction {
  id: string;
  client_id: string;
  user_id: string;
  interaction_date: string;
  result: "presupuesto" | "venta" | "seguimiento" | "sin_respuesta" | "no_interesado";
  medium: string;
  quote_path: string | null;
  total_amount: number | null;
  currency: string | null;
  attachment_url: string | null;
  reference_quote_id: string | null;
  followup_scenario: string | null;
  negotiation_state: string | null;
  followup_motive: string | null;
  historic_quote_amount: number | null;
  historic_quote_date: string | null;
  loss_reason: string | null;
  estimated_loss: number | null;
  next_step: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client_name?: string;
  interaction_lines?: CRMInteractionLine[];
}

export interface CRMInteractionLine {
  id: string;
  interaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name?: string;
}

export interface CRMDashboardStats {
  total_clients: number;
  active_clients: number;
  total_ventas: number;
  total_ingresos: number;
  pipeline: number;
  followups_pendientes: number;
}

// --- Clients ---
export function useCRMClients() {
  return useQuery<CRMClient[]>({
    queryKey: ["crm-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_clients")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as CRMClient[];
    },
  });
}

export function useCRMClient(id: string | null) {
  return useQuery<CRMClient | null>({
    queryKey: ["crm-client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_clients")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as CRMClient;
    },
  });
}

export function useCRMClientsMinimal() {
  return useQuery({
    queryKey: ["crm-clients-min"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_clients")
        .select("id, name, company, status")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertCRMClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (client: Partial<CRMClient> & { id?: string }) => {
      if (client.id) {
        const { id, ...rest } = client;
        const { error } = await supabase.from("crm_clients").update(rest as never).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("crm_clients").insert(client as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-clients"] });
      qc.invalidateQueries({ queryKey: ["crm-clients-min"] });
      qc.invalidateQueries({ queryKey: ["crm-dashboard"] });
    },
  });
}

export function useDeleteCRMClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-clients"] });
      qc.invalidateQueries({ queryKey: ["crm-dashboard"] });
    },
  });
}

// --- Products ---
export function useCRMProducts() {
  return useQuery<CRMProduct[]>({
    queryKey: ["crm-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_products")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as CRMProduct[];
    },
  });
}

export function useCRMActiveProducts() {
  return useQuery({
    queryKey: ["crm-products-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_products")
        .select("id, name, unit_label, currency, price")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertCRMProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<CRMProduct> & { id?: string }) => {
      if (product.id) {
        const { id, ...rest } = product;
        const { error } = await supabase.from("crm_products").update(rest as never).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("crm_products").insert(product as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-products"] });
      qc.invalidateQueries({ queryKey: ["crm-products-active"] });
    },
  });
}

// --- Interactions ---
export function useCRMInteractions(limit = 100) {
  return useQuery<CRMInteraction[]>({
    queryKey: ["crm-interactions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_interactions")
        .select("*, crm_clients(name), crm_interaction_lines(*, crm_products(name))")
        .order("interaction_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((i: any) => ({
        ...i,
        client_name: i.crm_clients?.name,
        interaction_lines: (i.crm_interaction_lines ?? []).map((l: any) => ({
          ...l,
          product_name: l.crm_products?.name,
        })),
      }));
    },
  });
}

export function useCRMClientInteractions(clientId: string | null) {
  return useQuery<CRMInteraction[]>({
    queryKey: ["crm-interactions-client", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_interactions")
        .select("*, crm_interaction_lines(*, crm_products(name))")
        .eq("client_id", clientId!)
        .order("interaction_date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((i: any) => ({
        ...i,
        interaction_lines: (i.crm_interaction_lines ?? []).map((l: any) => ({
          ...l,
          product_name: l.crm_products?.name,
        })),
      }));
    },
  });
}

export function useCreateCRMInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      interaction,
      lines,
    }: {
      interaction: Partial<CRMInteraction>;
      lines?: { product_id: string; quantity: number; unit_price: number }[];
    }) => {
      const { data, error } = await supabase
        .from("crm_interactions")
        .insert(interaction as never)
        .select("id")
        .single();
      if (error) throw error;

      if (lines && lines.length > 0) {
        const { error: linesError } = await supabase
          .from("crm_interaction_lines")
          .insert(
            lines.map((l) => ({
              interaction_id: data.id,
              product_id: l.product_id,
              quantity: l.quantity,
              unit_price: l.unit_price,
              line_total: l.quantity * l.unit_price,
            })) as never
          );
        if (linesError) throw linesError;
      }

      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-interactions"] });
      qc.invalidateQueries({ queryKey: ["crm-interactions-client"] });
      qc.invalidateQueries({ queryKey: ["crm-dashboard"] });
      qc.invalidateQueries({ queryKey: ["crm-clients"] });
    },
  });
}

export function useDeleteCRMInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_interactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-interactions"] });
      qc.invalidateQueries({ queryKey: ["crm-dashboard"] });
    },
  });
}

// --- Dashboard ---
export function useCRMDashboard() {
  return useQuery({
    queryKey: ["crm-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_crm_dashboard");
      if (error) throw error;
      return data as unknown as {
        clients: CRMClient[];
        interactions: CRMInteraction[];
        products: CRMProduct[];
        stats: CRMDashboardStats;
      };
    },
  });
}

// --- Seller Ranking ---
export function useCRMSellerRanking() {
  return useQuery({
    queryKey: ["crm-seller-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_seller_ranking")
        .select("*")
        .order("ingresos", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
