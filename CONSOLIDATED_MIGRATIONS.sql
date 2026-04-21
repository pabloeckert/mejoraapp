-- ============================================
-- MejoraApp - Todas las migraciones consolidadas
-- Generado: 2026-04-21 19:01 UTC
-- Proyecto Supabase: pwiduojwgkaoxxuautkp
-- ============================================


-- ============================================
-- MIGRATION: 20260415172925_3d53577e-5d7e-46c0-a55b-a47081e63650.sql
-- ============================================


-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  empresa TEXT,
  has_completed_diagnostic BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- User roles (separate table as required)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Diagnostic results table
CREATE TABLE public.diagnostic_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  perfil TEXT NOT NULL,
  puntaje_total INTEGER NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results"
  ON public.diagnostic_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON public.diagnostic_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- MIGRATION: 20260415175647_a8c35102-32ca-4abb-9c3b-90f0cf2d5a7a.sql
-- ============================================


-- Wall posts table (anonymous)
CREATE TABLE public.wall_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'pending')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read approved posts
CREATE POLICY "Anyone can view approved wall posts"
ON public.wall_posts
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Users can insert their own posts
CREATE POLICY "Users can create wall posts"
ON public.wall_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.wall_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Moderation log
CREATE TABLE public.moderation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view moderation logs
CREATE POLICY "Admins can view moderation logs"
ON public.moderation_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Wall post likes tracking
CREATE TABLE public.wall_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.wall_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
ON public.wall_likes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can like posts"
ON public.wall_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.wall_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for wall posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_posts;


-- ============================================
-- MIGRATION: 20260415180000_5903df0b-7a4b-4d7a-9ce6-93afc63680c7.sql
-- ============================================


-- Novedades table (admin-managed news)
CREATE TABLE public.novedades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  resumen TEXT,
  contenido TEXT,
  imagen_url TEXT,
  enlace_externo TEXT,
  publicado BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view published novedades
CREATE POLICY "Anyone can view published novedades"
ON public.novedades
FOR SELECT
TO authenticated
USING (publicado = true);

-- Admins can do everything
CREATE POLICY "Admins can insert novedades"
ON public.novedades
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update novedades"
ON public.novedades
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete novedades"
ON public.novedades
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_novedades_updated_at
BEFORE UPDATE ON public.novedades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Also add likes_count sync trigger for wall_posts
CREATE OR REPLACE FUNCTION public.update_wall_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wall_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wall_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_wall_likes_count
AFTER INSERT OR DELETE ON public.wall_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_wall_likes_count();


-- ============================================
-- MIGRATION: 20260415180253_0e28a524-9744-4309-8340-e76f3d5966d4.sql
-- ============================================


-- Admins can see ALL wall posts (not just approved)
CREATE POLICY "Admins can view all wall posts"
ON public.wall_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update wall posts (change status)
CREATE POLICY "Admins can update wall posts"
ON public.wall_posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert moderation logs
CREATE POLICY "Admins can insert moderation logs"
ON public.moderation_log
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role inserts moderation logs from edge function, but also allow admin manual moderation
-- Admins can also view all diagnostic results
CREATE POLICY "Admins can view all diagnostic results"
ON public.diagnostic_results
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));


-- ============================================
-- MIGRATION: 20260415204142_d4b96327-2dc9-405d-ae40-5ebcaf9ed270.sql
-- ============================================


CREATE TABLE public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  descripcion text,
  icono text DEFAULT 'BookOpen',
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.content_categories
  FOR SELECT TO authenticated USING (activa = true);

CREATE POLICY "Admins can manage categories" ON public.content_categories
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.content_categories(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  contenido text NOT NULL,
  fuente text DEFAULT 'ia',
  estado text NOT NULL DEFAULT 'publicado',
  created_by uuid,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts" ON public.content_posts
  FOR SELECT TO authenticated USING (estado = 'publicado');

CREATE POLICY "Admins can manage all posts" ON public.content_posts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.content_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.content_categories(id) ON DELETE CASCADE,
  instrucciones text NOT NULL,
  ejemplos text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage guidelines" ON public.content_guidelines
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

INSERT INTO public.content_categories (nombre, slug, descripcion, icono) VALUES
  ('Tip práctico', 'tip', 'Algo que podés aplicar hoy', 'Lightbulb'),
  ('Estrategia', 'estrategia', 'Una idea para tu negocio', 'FileText'),
  ('Reflexión', 'reflexion', 'Para cuestionar cómo operás', 'Brain'),
  ('Noticia', 'noticia', 'Lo que está pasando', 'Newspaper');


-- ============================================
-- MIGRATION: 20260418150000_add_wall_comments.sql
-- ============================================

-- Wall comments (replies to wall posts)
CREATE TABLE public.wall_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wall_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view approved comments
CREATE POLICY "Anyone can view approved wall comments"
ON public.wall_comments
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Users can create comments
CREATE POLICY "Users can create wall comments"
ON public.wall_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own wall comments"
ON public.wall_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can update comment status
CREATE POLICY "Admins can update wall comments"
ON public.wall_comments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add comments_count to wall_posts for denormalized count
ALTER TABLE public.wall_posts ADD COLUMN comments_count INTEGER NOT NULL DEFAULT 0;

-- Function to update comments_count on insert/delete
CREATE OR REPLACE FUNCTION public.update_wall_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE public.wall_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE public.wall_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE public.wall_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE public.wall_posts SET comments_count = comments_count - 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wall_comments_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.wall_comments
FOR EACH ROW EXECUTE FUNCTION public.update_wall_post_comments_count();

-- Enable realtime for wall_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_comments;


-- ============================================
-- MIGRATION: 20260418160000_add_content_media_fields.sql
-- ============================================

-- Add media fields to content_posts for rich content types
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'infographic', 'book'));
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS resumen TEXT;

-- Insert sample content with different media types
-- VIDEOS
INSERT INTO public.content_posts (titulo, contenido, content_type, video_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Cómo definir tu propuesta de valor en 5 minutos',
  E'La mayoría de los emprendedores caen en el error de querer ser todo para todos. Eso es una receta para ser invisible.\n\nTu propuesta de valor tiene que responder UNA sola pregunta: ¿por qué alguien te elegiría a vos en vez de a tu competencia?\n\nEn este video te mostramos el ejercicio de los 3 filtros:\n1. ¿Qué problema específico resolvés?\n2. ¿Qué hacés diferente?\n3. ¿Por qué debería importarle al cliente?\n\nSi no podés responder las 3 en una oración, todavía no tenés propuesta de valor. Tenés un slogan vacío.\n\nMirá el video, hacé el ejercicio hoy. Mañana ya es tarde.',
  'video',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Ejercicio práctico de 5 minutos para definir qué te hace único frente a la competencia.',
  (SELECT id FROM public.content_categories WHERE slug = 'tip' LIMIT 1),
  'publicado',
  'admin',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Cómo definir tu propuesta de valor en 5 minutos');

-- INFOGRAPHIC
INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Los 7 errores que te están fundiendo (infografía)',
  E'Esta infografía resume los 7 errores más comunes que cometen los emprendedores argentinos:\n\n1. No separar las finanzas personales de las del negocio\n2. Fijar precios por lo que cobra la competencia (no por tu valor)\n3. No tener un sistema de seguimiento de clientes\n4. Reinventar la rueda en vez de usar procesos\n5. No medir nada (si no medís, no gestionás)\n6. Esperar el momento perfecto para lanzar\n7. No pedir ayuda cuando la necesitás\n\nDescargá la infografía, pegala en tu pared de trabajo. Cada semana revisá cuántos de estos errores estás cometiendo. El objetivo: llegar a cero.',
  'infographic',
  'https://placehold.co/800x1200/1e40af/ffffff?text=7+Errores+que+te+Funden%0AInfografia+MejoraApp',
  'Infografía con los 7 errores más comunes de emprendedores. Pegala en tu pared.',
  (SELECT id FROM public.content_categories WHERE slug = 'reflexion' LIMIT 1),
  'publicado',
  'ia',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Los 7 errores que te están fundiendo (infografía)');

-- BOOK / PDF
INSERT INTO public.content_posts (titulo, contenido, content_type, pdf_url, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Guía: Cómo armar tu primer plan de negocios (PDF)',
  E'Tener un plan de negocios no es burocracia. Es brújula.\n\nEsta guía de 12 páginas te lleva paso a paso:\n\nCAPÍTULO 1 — Definí tu visión\n¿Dónde querés estar en 12 meses? No más, no menos.\n\nCAPÍTULO 2 — Conocé tu mercado\nQuién te compra, por qué, cuánto está dispuesto a pagar.\n\nCAPÍTULO 3 — Tu modelo de ingresos\nCómo entra la plata. Fijo, recurrente, por proyecto.\n\nCAPÍTULO 4 — Costos reales\nLo que nadie cuenta: tu tiempo tiene un costo.\n\nCAPÍTULO 5 — Proyección a 12 meses\nNúmeros honestos. Ni optimistas ni pesimistas.\n\nCAPÍTULO 6 — Plan de acción\n3 prioridades por trimestre. Solo 3.\n\nDescargala gratis. Lela hoy. Aplicá mañana.',
  'book',
  'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
  'https://placehold.co/400x560/dc2626/ffffff?text=Plan+de+Negocios%0AGuia+MejoraApp',
  'Guía descargable de 12 páginas para armar tu primer plan de negocios desde cero.',
  (SELECT id FROM public.content_categories WHERE slug = 'estrategia' LIMIT 1),
  'publicado',
  'ia',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Guía: Cómo armar tu primer plan de negocios (PDF)');

-- ARTICLE (existing style, with image)
INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Dejá de competir por precio. Ahora.',
  E'Cada vez que bajás un precio para cerrar una venta, le estás mandando un mensaje a tu cliente: "lo que hago no vale lo que pido".\n\nEl cliente que te elige por precio se va por precio. No hay lealtad en la baratura.\n\nLa solución no es ser caro. Es ser claro.\n\n¿Qué problema resolvés? ¿Cuánto le cuesta a tu cliente NO resolverlo? Ahí está tu precio.\n\nEjemplo real: Un contador que cobra $50.000/mes parece caro hasta que le mostrás que te está ahorrando $200.000 en impuestos que pagarías mal.\n\nCobrá por lo que generás, no por lo que hacés. Hay una diferencia enorme.',
  'article',
  'https://placehold.co/800x400/0f172a/fbbf24?text=No+compitas+por+precio',
  'Por qué bajar precios es una trampa y cómo fijar precios por valor real.',
  (SELECT id FROM public.content_categories WHERE slug = 'estrategia' LIMIT 1),
  'publicado',
  'admin',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Dejá de competir por precio. Ahora.');

-- Another VIDEO
INSERT INTO public.content_posts (titulo, contenido, content_type, video_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Sistema de seguimiento de clientes en 15 minutos',
  E'¿Cuántos clientes potenciales perdés por no hacer seguimiento?\n\nEl 80% de las ventas se cierran entre el 5° y 12° contacto. La mayoría se rinde después del 2°.\n\nEn este video te armamos un sistema de seguimiento con herramientas gratuitas:\n- Google Sheets como CRM básico\n- Recordatorios automáticos\n- Scripts de mensajes que no suenan a spam\n\nNo necesitás un CRM caro. Necesitás disciplina y un proceso.\n\n15 minutos. Un spreadsheet. Cero excusas.',
  'video',
  'https://www.youtube.com/embed/jNQXAC9IVRw',
  'Armá un sistema de seguimiento de clientes con herramientas gratis en 15 minutos.',
  (SELECT id FROM public.content_categories WHERE slug = 'tip' LIMIT 1),
  'publicado',
  'admin',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Sistema de seguimiento de clientes en 15 minutos');

-- Another INFOGRAPHIC
INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Mapa de decisiones: ¿Es momento de invertir o ahorrar?',
  E'Cada peso que entra a tu negocio es una decisión: ¿lo invertís o lo guardás?\n\nLa mayoría de los emprendedores caen en dos extremos:\n- Reinvierten todo y no tienen colchón para imprevistos\n- Ahorran todo y el negocio no crece\n\nEsta infografía te da el mapa de decisión:\n\n¿Tenés fondo de emergencia de 3 meses? → SÍ: invertí. → NO: ahorrá.\n¿La inversión tiene retorno en 90 días? → SÍ: priorizala. → NO: escalala.\n¿Podés medir el resultado? → SÍ: hacela. → NO: replanteala.\n\nRegla de oro: 30% ahorro, 70% inversión medible. Siempre.',
  'infographic',
  'https://placehold.co/800x1000/059669/ffffff?text=Mapa+de+Decisiones%0AInvertir+o+Ahorrar',
  'Mapa visual para decidir si invertir o ahorrar cada peso que entra.',
  (SELECT id FROM public.content_categories WHERE slug = 'tip' LIMIT 1),
  'publicado',
  'ia',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Mapa de decisiones: ¿Es momento de invertir o ahorrar?');


-- ============================================
-- MIGRATION: 20260418164609_ed05979e-a21f-4245-95cc-3e770ee64f91.sql
-- ============================================


-- 1) profiles: add nombre, apellido, cargo, email
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nombre text,
  ADD COLUMN IF NOT EXISTS apellido text,
  ADD COLUMN IF NOT EXISTS cargo text,
  ADD COLUMN IF NOT EXISTS email text;

-- 2) content_posts: add resumen, content_type, video_url, pdf_url, imagen_url
ALTER TABLE public.content_posts
  ADD COLUMN IF NOT EXISTS resumen text,
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'article',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS imagen_url text;

-- 3) wall_posts: add comments_count
ALTER TABLE public.wall_posts
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

-- 4) wall_comments table
CREATE TABLE IF NOT EXISTS public.wall_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  parent_id uuid REFERENCES public.wall_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wall_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved wall comments"
  ON public.wall_comments FOR SELECT TO authenticated
  USING (status = 'approved');

CREATE POLICY "Admins can view all wall comments"
  ON public.wall_comments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create wall comments"
  ON public.wall_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.wall_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update wall comments"
  ON public.wall_comments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to maintain comments_count
CREATE OR REPLACE FUNCTION public.update_wall_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wall_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wall_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_wall_comments_count ON public.wall_comments;
CREATE TRIGGER trg_wall_comments_count
  AFTER INSERT OR DELETE ON public.wall_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_wall_comments_count();

-- 5) admin_config table (key/value store for app settings like master password)
CREATE TABLE IF NOT EXISTS public.admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_config"
  ON public.admin_config FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert admin_config"
  ON public.admin_config FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update admin_config"
  ON public.admin_config FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete admin_config"
  ON public.admin_config FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- ============================================
-- MIGRATION: 20260418170000_add_admin_config.sql
-- ============================================

-- Admin master password config table
CREATE TABLE public.admin_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write admin config
CREATE POLICY "Only admins can read admin config"
ON public.admin_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can write admin config"
ON public.admin_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial config
-- Password hash is SHA-256 of "T@beg2301" (lowercased for consistency)
-- Security questions for recovery
INSERT INTO public.admin_config (key, value) VALUES
  ('master_password_hash', encode(digest('T@beg2301', 'sha256'), 'hex')),
  ('recovery_question_1', '¿Cuál es el nombre de tu primera mascota?'),
  ('recovery_answer_1_hash', encode(digest('mejoraapp', 'sha256'), 'hex')),
  ('recovery_question_2', '¿En qué ciudad naciste?'),
  ('recovery_answer_2_hash', encode(digest('buenosaires', 'sha256'), 'hex')),
  ('recovery_email', 'admin@mejoraapp.com'),
  ('admin_version', '1');


-- ============================================
-- MIGRATION: 20260418180000_add_profile_fields.sql
-- ============================================

-- Add new profile fields for admin user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS apellido TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Migrate existing display_name to nombre if nombre is null
UPDATE public.profiles SET nombre = display_name WHERE nombre IS NULL AND display_name IS NOT NULL;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Add admin update policy for profiles
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));


-- ============================================
-- MIGRATION: 20260418180100_update_profile_trigger.sql
-- ============================================

-- Update handle_new_user to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ============================================
-- MIGRATION: 20260418190000_update_name_split.sql
-- ============================================

-- Update handle_new_user to split full_name into nombre and apellido
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  name_parts TEXT[];
  first_name TEXT;
  last_name TEXT;
BEGIN
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');

  -- Split name into parts
  IF full_name != '' THEN
    name_parts := string_to_array(full_name, ' ');
    first_name := name_parts[1];
    -- Join everything after first name as apellido
    IF array_length(name_parts, 1) > 1 THEN
      last_name := array_to_string(name_parts[2:], ' ');
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, display_name, email, nombre, apellido)
  VALUES (
    NEW.id,
    COALESCE(full_name, NEW.email),
    NEW.email,
    first_name,
    last_name
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

