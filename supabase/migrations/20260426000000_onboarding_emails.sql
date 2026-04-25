-- ============================================================
-- MIGRACIÓN: Email onboarding sequence (día 1, 3, 7)
-- Fecha: 2026-04-26
-- ============================================================

-- Tabla para tracking de emails de onboarding enviados
CREATE TABLE IF NOT EXISTS public.onboarding_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('day1', 'day3', 'day7')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, email_type)
);

-- Índice para queries de "qué usuarios necesitan email"
CREATE INDEX IF NOT EXISTS idx_onboarding_emails_user ON public.onboarding_emails(user_id);

-- RLS: solo service_role puede leer/escribir (las Edge Functions lo usan)
ALTER TABLE public.onboarding_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages onboarding emails"
  ON public.onboarding_emails
  FOR ALL
  USING (false)  -- nadie desde el cliente
  WITH CHECK (false);

-- Función: retorna usuarios que necesitan un email de onboarding
-- day1: 24h después del signup, sin email day1
-- day3: 72h después del signup, sin email day3
-- day7: 168h después del signup, sin email day7
CREATE OR REPLACE FUNCTION get_users_needing_onboarding_email()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  nombre TEXT,
  email_type TEXT,
  signup_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id AS user_id,
    au.email,
    COALESCE(p.nombre, '') AS nombre,
    CASE
      WHEN au.created_at <= now() - INTERVAL '168 hours'
           AND NOT EXISTS (SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = au.id AND oe.email_type = 'day7')
        THEN 'day7'
      WHEN au.created_at <= now() - INTERVAL '72 hours'
           AND NOT EXISTS (SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = au.id AND oe.email_type = 'day3')
        THEN 'day3'
      WHEN au.created_at <= now() - INTERVAL '24 hours'
           AND NOT EXISTS (SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = au.id AND oe.email_type = 'day1')
        THEN 'day1'
    END AS email_type,
    au.created_at AS signup_date
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.created_at <= now() - INTERVAL '24 hours'
    AND au.created_at >= now() - INTERVAL '336 hours'  -- no enviar después de 14 días
    AND au.email_confirmed_at IS NOT NULL  -- solo emails confirmados
    AND (
      (au.created_at <= now() - INTERVAL '168 hours'
       AND NOT EXISTS (SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = au.id AND oe.email_type = 'day7'))
      OR
      (au.created_at <= now() - INTERVAL '72 hours'
       AND NOT EXISTS (SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = au.id AND oe.email_type = 'day3'))
      OR
      (au.created_at <= now() - INTERVAL '24 hours'
       AND NOT EXISTS (SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = au.id AND oe.email_type = 'day1'))
    )
  ORDER BY au.created_at ASC
  LIMIT 50;
END;
$$;

-- Grant para service_role
GRANT EXECUTE ON FUNCTION get_users_needing_onboarding_email() TO service_role;
GRANT ALL ON public.onboarding_emails TO service_role;
