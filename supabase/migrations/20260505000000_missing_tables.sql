-- ============================================================
-- MIGRACIÓN CONSOLIDADA: Tablas faltantes para MejoraApp
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 2026-05-05
-- ============================================================

-- 1. push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. crm_clients
CREATE TABLE IF NOT EXISTS public.crm_clients (
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
  first_contact_date DATE,
  status TEXT NOT NULL DEFAULT 'prospect',
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages CRM clients"
  ON public.crm_clients
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. crm_products
CREATE TABLE IF NOT EXISTS public.crm_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  unit TEXT NOT NULL DEFAULT 'unit',
  unit_label TEXT NOT NULL DEFAULT 'unidad',
  currency TEXT NOT NULL DEFAULT 'ARS',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages CRM products"
  ON public.crm_products
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. crm_interactions
CREATE TABLE IF NOT EXISTS public.crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  interaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  result TEXT NOT NULL,
  medium TEXT NOT NULL,
  quote_path TEXT,
  total_amount NUMERIC,
  currency TEXT,
  attachment_url TEXT,
  reference_quote_id TEXT,
  followup_scenario TEXT,
  negotiation_state TEXT,
  followup_motive TEXT,
  historic_quote_amount NUMERIC,
  historic_quote_date DATE,
  loss_reason TEXT,
  estimated_loss NUMERIC,
  next_step TEXT,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages CRM interactions"
  ON public.crm_interactions
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. crm_interaction_lines
CREATE TABLE IF NOT EXISTS public.crm_interaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES public.crm_interactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.crm_products(id),
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.crm_interaction_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages CRM interaction lines"
  ON public.crm_interaction_lines
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. community_challenges
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'weekly',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  participant_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read active challenges"
  ON public.community_challenges
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admin manages challenges"
  ON public.community_challenges
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. challenge_participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read participants"
  ON public.challenge_participants
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users manage own participation"
  ON public.challenge_participants
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: update participant_count on challenge_participants
CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_challenges
    SET participant_count = participant_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_challenges
    SET participant_count = GREATEST(participant_count - 1, 0)
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_challenge_participant_count
  AFTER INSERT OR DELETE ON public.challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_participant_count();

-- 8. mentor_conversations
CREATE TABLE IF NOT EXISTS public.mentor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mentor conversations"
  ON public.mentor_conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Vista: public_profiles (directorio de miembros)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  p.user_id AS id,
  p.nombre,
  p.apellido,
  p.display_name,
  p.empresa,
  p.cargo,
  p.bio,
  p.city,
  p.industry,
  p.linkedin,
  p.avatar_url,
  COALESCE(badge_counts.badge_count, 0)::INTEGER AS badge_count,
  COALESCE(post_counts.post_count, 0)::INTEGER AS post_count,
  COALESCE(like_counts.total_likes, 0)::INTEGER AS total_likes
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) AS badge_count
  FROM public.user_badges
  GROUP BY user_id
) badge_counts ON badge_counts.user_id = p.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS post_count
  FROM public.wall_posts
  WHERE status = 'approved'
  GROUP BY user_id
) post_counts ON post_counts.user_id = p.user_id
LEFT JOIN (
  SELECT wp.user_id, COUNT(wl.id) AS total_likes
  FROM public.wall_likes wl
  JOIN public.wall_posts wp ON wp.id = wl.post_id
  GROUP BY wp.user_id
) like_counts ON like_counts.user_id = p.user_id;

-- 10. Vista: crm_seller_ranking
CREATE OR REPLACE VIEW public.crm_seller_ranking AS
SELECT
  ci.user_id,
  COALESCE(p.display_name, p.nombre, 'Sin nombre') AS display_name,
  COUNT(*) FILTER (WHERE ci.result = 'venta_concretada') AS ventas,
  COALESCE(SUM(ci.total_amount) FILTER (WHERE ci.result = 'venta_concretada'), 0) AS ingresos,
  COUNT(*) AS interactions
FROM public.crm_interactions ci
LEFT JOIN public.profiles p ON p.user_id = ci.user_id
GROUP BY ci.user_id, p.display_name, p.nombre;

-- 11. Vista: crm_client_summary
CREATE OR REPLACE VIEW public.crm_client_summary AS
SELECT
  c.id,
  c.name,
  c.company,
  c.status,
  c.assigned_to,
  COUNT(ci.id) AS interaction_count,
  MAX(ci.interaction_date) AS last_interaction,
  COALESCE(SUM(ci.total_amount) FILTER (WHERE ci.result = 'venta_concretada'), 0) AS total_revenue
FROM public.crm_clients c
LEFT JOIN public.crm_interactions ci ON ci.client_id = c.id
GROUP BY c.id, c.name, c.company, c.status, c.assigned_to;

-- 12. RPC: get_crm_dashboard
CREATE OR REPLACE FUNCTION public.get_crm_dashboard()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_clients', (SELECT COUNT(*) FROM crm_clients),
    'active_clients', (SELECT COUNT(*) FROM crm_clients WHERE status = 'activo'),
    'total_interactions', (SELECT COUNT(*) FROM crm_interactions),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM crm_interactions WHERE result = 'venta_concretada'),
    'pending_followups', (SELECT COUNT(*) FROM crm_interactions WHERE follow_up_date <= now() + INTERVAL '3 days' AND next_step IS NOT NULL),
    'top_sellers', (
      SELECT json_agg(row_to_json(r))
      FROM (
        SELECT user_id, display_name, ventas, ingresos
        FROM crm_seller_ranking
        ORDER BY ventas DESC
        LIMIT 5
      ) r
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_crm_dashboard() TO authenticated;

-- 13. Grants para service_role en vistas
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.crm_seller_ranking TO authenticated;
GRANT SELECT ON public.crm_client_summary TO authenticated;

-- ============================================================
-- FIN MIGRACIÓN CONSOLIDADA
-- ============================================================
