-- Migration: Admin audit log + rate limiting support
-- Date: 2026-04-24
-- Sprint: 6.1.2 + 6.1.4

-- Tabla de auditoría para acciones admin
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  params TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- RLS: solo admins pueden leer el log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin audit log: solo lectura por admins"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- No permitir inserts desde cliente (solo Edge Functions con service_role)
CREATE POLICY "Admin audit log: solo service_role inserta"
  ON admin_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Limpieza automática: retener 90 días
-- (Ejecutar periódicamente o como cron job en Supabase)
-- DELETE FROM admin_audit_log WHERE created_at < now() - INTERVAL '90 days';
