-- Migración de seguridad — 2026-04-23
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Requiere: que las 12 tablas base ya existan (CLEAN_SETUP.sql ejecutado previamente)

-- ============================================================
-- 1. Tabla moderation_comments_log (referenciada por Edge Function)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.moderation_comments_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.wall_comments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. Habilitar Realtime en tablas críticas
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.wall_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.wall_comments;

-- ============================================================
-- 3. RLS para moderation_comments_log (solo service_role)
-- ============================================================
ALTER TABLE public.moderation_comments_log ENABLE ROW LEVEL SECURITY;

-- Solo el service_role puede leer/escribir (Edge Functions)
DROP POLICY IF EXISTS "Service role only for moderation_comments_log" ON public.moderation_comments_log;
CREATE POLICY "Service role only for moderation_comments_log"
  ON public.moderation_comments_log
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 4. Función helper: verificar si un usuario es admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- ============================================================
-- 5. Políticas RLS mejoradas para operaciones admin
-- ============================================================

-- profiles: lectura pública, escritura solo admin o propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- user_roles: solo admin puede gestionar
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- admin_config: solo admin puede leer (cerrar lectura pública)
DROP POLICY IF EXISTS "Anyone can read admin config" ON public.admin_config;
DROP POLICY IF EXISTS "Only admins can read admin config" ON public.admin_config;
CREATE POLICY "Only admins can read admin config"
  ON public.admin_config FOR SELECT
  USING (public.is_admin(auth.uid()));

-- admin_config: solo admin puede escribir
DROP POLICY IF EXISTS "Only admins can write admin config" ON public.admin_config;
CREATE POLICY "Only admins can write admin config"
  ON public.admin_config FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- content_posts: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "Public can read content" ON public.content_posts;
CREATE POLICY "Public can read content"
  ON public.content_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage content" ON public.content_posts;
CREATE POLICY "Admins can manage content"
  ON public.content_posts
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- content_categories: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "Public can read categories" ON public.content_categories;
CREATE POLICY "Public can read categories"
  ON public.content_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.content_categories;
CREATE POLICY "Admins can manage categories"
  ON public.content_categories
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- novedades: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "Public can read novedades" ON public.novedades;
CREATE POLICY "Public can read novedades"
  ON public.novedades FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage novedades" ON public.novedades;
CREATE POLICY "Admins can manage novedades"
  ON public.novedades
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
