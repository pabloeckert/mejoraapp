-- Migración de seguridad — 2026-04-23
-- Etapa 1: RLS hardening + función is_admin + tabla moderation_comments_log

-- ============================================================
-- 1. Tabla moderation_comments_log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.moderation_comments_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.wall_comments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.moderation_comments_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for moderation_comments_log"
  ON public.moderation_comments_log
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 2. Función is_admin (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'::app_role
  );
$$;

-- ============================================================
-- 3. RLS: admin_config — cerrar lectura pública
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read admin config" ON public.admin_config;
DROP POLICY IF EXISTS "Only admins can read admin config" ON public.admin_config;

CREATE POLICY "Only admins can read admin config"
  ON public.admin_config FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can write admin config" ON public.admin_config;
CREATE POLICY "Only admins can write admin config"
  ON public.admin_config FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 4. RLS: profiles — admin puede editar cualquier perfil
-- ============================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- ============================================================
-- 5. RLS: user_roles — solo admin gestiona roles
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 6. RLS: content_posts — lectura pública, escritura admin
-- ============================================================
DROP POLICY IF EXISTS "Public can read content" ON public.content_posts;
CREATE POLICY "Public can read content"
  ON public.content_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage content" ON public.content_posts;
CREATE POLICY "Admins can manage content"
  ON public.content_posts
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 7. RLS: content_categories — lectura pública, escritura admin
-- ============================================================
DROP POLICY IF EXISTS "Public can read categories" ON public.content_categories;
CREATE POLICY "Public can read categories"
  ON public.content_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.content_categories;
CREATE POLICY "Admins can manage categories"
  ON public.content_categories
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 8. RLS: novedades — lectura pública, escritura admin
-- ============================================================
DROP POLICY IF EXISTS "Public can read novedades" ON public.novedades;
CREATE POLICY "Public can read novedades"
  ON public.novedades FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage novedades" ON public.novedades;
CREATE POLICY "Admins can manage novedades"
  ON public.novedades
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
