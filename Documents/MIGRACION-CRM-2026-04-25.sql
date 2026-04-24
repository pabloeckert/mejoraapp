-- ============================================================
-- MIGRACIÓN CRM — Integrar tablas de MejoraCRM en MejoraApp
-- Ejecutar en Supabase SQL Editor
-- Fecha: 2026-04-25
-- ============================================================

-- 1. ENUMS (solo crear si no existen)
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'supervisor', 'vendedor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('activo', 'potencial', 'inactivo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE interaction_result AS ENUM ('presupuesto', 'venta', 'seguimiento', 'sin_respuesta', 'no_interesado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE interaction_medium AS ENUM ('whatsapp', 'llamada', 'email', 'reunion_presencial', 'reunion_virtual', 'md_instagram', 'md_facebook', 'md_linkedin', 'visita_campo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE currency_code AS ENUM ('ARS', 'USD', 'EUR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_path AS ENUM ('catalogo', 'adjunto');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE followup_scenario AS ENUM ('vinculado', 'independiente', 'historico');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE negotiation_state AS ENUM ('con_interes', 'sin_respuesta', 'revisando', 'pidio_cambios');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABLA: crm_clients
CREATE TABLE IF NOT EXISTS crm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  contact_name TEXT,
  segment TEXT,
  location TEXT,
  province TEXT,
  address TEXT,
  whatsapp TEXT,
  email TEXT,
  channel TEXT,
  first_contact_date DATE DEFAULT CURRENT_DATE,
  status client_status DEFAULT 'potencial',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: crm_products
CREATE TABLE IF NOT EXISTS crm_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(12,2),
  unit TEXT DEFAULT 'u',
  unit_label TEXT DEFAULT 'Unidad',
  currency currency_code DEFAULT 'ARS',
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA: crm_interactions
CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  interaction_date TIMESTAMPTZ DEFAULT now(),
  result interaction_result NOT NULL,
  medium interaction_medium NOT NULL,
  quote_path quote_path,
  total_amount NUMERIC(14,2),
  currency currency_code,
  attachment_url TEXT,
  reference_quote_id UUID REFERENCES crm_interactions(id),
  followup_scenario followup_scenario,
  negotiation_state negotiation_state,
  followup_motive TEXT,
  historic_quote_amount NUMERIC(14,2),
  historic_quote_date DATE,
  loss_reason TEXT,
  estimated_loss NUMERIC(14,2),
  next_step TEXT,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLA: crm_interaction_lines
CREATE TABLE IF NOT EXISTS crm_interaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES crm_interactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES crm_products(id) ON DELETE RESTRICT,
  quantity NUMERIC(14,3) DEFAULT 1,
  unit_price NUMERIC(14,2) DEFAULT 0,
  line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_crm_clients_status ON crm_clients(status);
CREATE INDEX IF NOT EXISTS idx_crm_clients_assigned ON crm_clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_client ON crm_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_user ON crm_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_date ON crm_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_result ON crm_interactions(result);
CREATE INDEX IF NOT EXISTS idx_crm_interaction_lines_interaction ON crm_interaction_lines(interaction_id);
CREATE INDEX IF NOT EXISTS idx_crm_interaction_lines_product ON crm_interaction_lines(product_id);

-- 7. TRIGGER: updated_at automático
CREATE OR REPLACE FUNCTION update_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_clients_updated ON crm_clients;
CREATE TRIGGER trg_crm_clients_updated
  BEFORE UPDATE ON crm_clients
  FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS trg_crm_interactions_updated ON crm_interactions;
CREATE TRIGGER trg_crm_interactions_updated
  BEFORE UPDATE ON crm_interactions
  FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();

-- 8. RLS — Solo admins acceden al CRM
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interaction_lines ENABLE ROW LEVEL SECURITY;

-- Policies: solo admins (usando la función is_admin existente)
CREATE POLICY "crm_clients_admin_all" ON crm_clients
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "crm_products_admin_all" ON crm_products
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "crm_interactions_admin_all" ON crm_interactions
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "crm_interaction_lines_admin_all" ON crm_interaction_lines
  FOR ALL USING (is_admin(auth.uid()));

-- 9. VISTA: resumen de clientes con última interacción
CREATE OR REPLACE VIEW crm_client_summary AS
SELECT
  c.id AS client_id,
  c.name,
  c.company,
  c.segment,
  c.province,
  c.status,
  c.assigned_to,
  c.created_at AS client_created_at,
  c.whatsapp,
  c.email,
  c.channel,
  (SELECT i.interaction_date FROM crm_interactions i WHERE i.client_id = c.id ORDER BY i.interaction_date DESC LIMIT 1) AS last_interaction_date,
  (SELECT i.result FROM crm_interactions i WHERE i.client_id = c.id ORDER BY i.interaction_date DESC LIMIT 1) AS last_result,
  (SELECT COUNT(*) FROM crm_interactions i WHERE i.client_id = c.id) AS total_interactions,
  (SELECT COUNT(*) FROM crm_interactions i WHERE i.client_id = c.id AND i.result = 'venta') AS total_ventas,
  (SELECT COALESCE(SUM(i.total_amount), 0) FROM crm_interactions i WHERE i.client_id = c.id AND i.result = 'venta') AS total_ingresos
FROM crm_clients c;

-- 10. VISTA: ranking de vendedores
CREATE OR REPLACE VIEW crm_seller_ranking AS
SELECT
  p.user_id,
  COALESCE(p.nombre || ' ' || p.apellido, p.nombre, 'Sin nombre') AS full_name,
  COUNT(*) AS total_interactions,
  COUNT(*) FILTER (WHERE i.result = 'venta') AS ventas_count,
  COUNT(*) FILTER (WHERE i.result = 'presupuesto') AS presupuestos_count,
  COALESCE(SUM(i.total_amount) FILTER (WHERE i.result = 'venta'), 0) AS ingresos,
  COALESCE(SUM(i.total_amount) FILTER (WHERE i.result = 'presupuesto'), 0) AS pipeline
FROM crm_interactions i
JOIN profiles p ON p.user_id = i.user_id
WHERE i.interaction_date >= date_trunc('month', now())
GROUP BY p.user_id, p.nombre, p.apellido;

-- 11. RPC: datos del dashboard CRM
CREATE OR REPLACE FUNCTION get_crm_dashboard()
RETURNS JSONB AS $$
SELECT jsonb_build_object(
  'clients', (
    SELECT jsonb_agg(row_to_json(c)) FROM crm_clients c
  ),
  'interactions', (
    SELECT jsonb_agg(sub.*)
    FROM (
      SELECT
        i.*,
        cl.name AS client_name,
        (
          SELECT jsonb_agg(
            row_to_json(l)::jsonb || jsonb_build_object('product_name', pr.name)
          )
          FROM crm_interaction_lines l
          LEFT JOIN crm_products pr ON pr.id = l.product_id
          WHERE l.interaction_id = i.id
        ) AS interaction_lines
      FROM crm_interactions i
      LEFT JOIN crm_clients cl ON cl.id = i.client_id
      ORDER BY i.interaction_date DESC
      LIMIT 200
    ) sub
  ),
  'products', (
    SELECT jsonb_agg(row_to_json(p)) FROM crm_products p WHERE p.active = true
  ),
  'stats', jsonb_build_object(
    'total_clients', (SELECT COUNT(*) FROM crm_clients),
    'active_clients', (SELECT COUNT(*) FROM crm_clients WHERE status = 'activo'),
    'total_ventas', (SELECT COUNT(*) FROM crm_interactions WHERE result = 'venta' AND interaction_date >= date_trunc('month', now())),
    'total_ingresos', (SELECT COALESCE(SUM(total_amount), 0) FROM crm_interactions WHERE result = 'venta' AND interaction_date >= date_trunc('month', now())),
    'pipeline', (SELECT COALESCE(SUM(total_amount), 0) FROM crm_interactions WHERE result = 'presupuesto' AND interaction_date >= date_trunc('month', now())),
    'followups_pendientes', (SELECT COUNT(*) FROM crm_interactions WHERE follow_up_date <= CURRENT_DATE AND result = 'seguimiento')
  )
);
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- FIN MIGRACIÓN CRM
-- ============================================================
