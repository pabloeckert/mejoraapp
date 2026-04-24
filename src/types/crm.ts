// CRM Table Types — declarations for tables added via MIGRACION-CRM-2026-04-25.sql
// These extend the auto-generated Supabase types

export interface CRMClientRow {
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

export interface CRMProductRow {
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

export interface CRMInteractionRow {
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
}

export interface CRMInteractionLineRow {
  id: string;
  interaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
}
