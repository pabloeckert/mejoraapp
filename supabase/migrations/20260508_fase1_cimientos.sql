-- ============================================================
-- MIGRACIÓN: Fase 1 — Cimientos
-- Fecha: 2026-05-08
-- Descripción: Agregar access_level a profiles + crear tablas nuevas
-- ============================================================

-- 1. Crear enum para nivel de acceso
CREATE TYPE access_level AS ENUM ('N0', 'N1', 'N2', 'ADMIN');

-- 2. Agregar campos nuevos a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS access_level access_level NOT NULL DEFAULT 'N0',
  ADD COLUMN IF NOT EXISTS nickname text UNIQUE,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS birthday date,
  ADD COLUMN IF NOT EXISTS membership_expires_at timestamptz;

-- 3. Crear tabla events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location text,
  max_attendees integer DEFAULT 0,
  min_access_level access_level NOT NULL DEFAULT 'N0',
  image_url text,
  qr_code text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Crear tabla event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  attended_at timestamptz,
  UNIQUE(event_id, user_id)
);

-- 5. Crear tabla payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  payment_method text,
  external_id text, -- ID de Tiendup u otro gateway
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  access_level_granted access_level,
  period_start timestamptz,
  period_end timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Crear tabla emergencies
CREATE TABLE IF NOT EXISTS emergencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  whatsapp_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_min_access ON events(min_access_level);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_user ON emergencies(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_access_level ON profiles(access_level);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);

-- 8. RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;

-- Events: todos pueden ver, solo admin puede crear/editar
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "events_update" ON events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Event registrations: usuario ve las suyas, admin ve todas
CREATE POLICY "event_reg_select_own" ON event_registrations FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_reg_insert" ON event_registrations FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "event_reg_update_own" ON event_registrations FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Payments: usuario ve los suyos, admin ve todos
CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "payments_insert_admin" ON payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Emergencies: usuario ve las suyas, admin ve todas
CREATE POLICY "emergencies_select_own" ON emergencies FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "emergencies_insert" ON emergencies FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- 9. Trigger para updated_at en nuevas tablas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Comentarios
COMMENT ON TABLE events IS 'Eventos de la comunidad con inscripción y aforo';
COMMENT ON TABLE event_registrations IS 'Inscripciones a eventos';
COMMENT ON TABLE payments IS 'Historial de pagos y membresías';
COMMENT ON TABLE emergencies IS 'Botón de emergencia - historial de activaciones';
COMMENT ON COLUMN profiles.access_level IS 'Nivel de acceso: N0 (gratis), N1 (pago básico), N2 (premium), ADMIN';
COMMENT ON COLUMN profiles.nickname IS 'Apodo visible para niveles pagos';
