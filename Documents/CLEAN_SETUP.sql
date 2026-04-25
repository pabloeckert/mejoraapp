-- ============================================
-- MejoraApp - Setup limpio de base de datos
-- Proyecto: pwiduojwgkaoxxuautkp
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. FUNCIONES BASE
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 2. ROLES (necesario antes de policies)
-- ============================================

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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PROFILES
-- ============================================

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  empresa TEXT,
  nombre TEXT,
  apellido TEXT,
  cargo TEXT,
  email TEXT,
  has_completed_diagnostic BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  name_parts TEXT[];
  first_name TEXT;
  last_name TEXT;
BEGIN
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  IF full_name != '' THEN
    name_parts := string_to_array(full_name, ' ');
    first_name := name_parts[1];
    IF array_length(name_parts, 1) > 1 THEN
      last_name := array_to_string(name_parts[2:], ' ');
    END IF;
  END IF;
  INSERT INTO public.profiles (user_id, display_name, email, nombre, apellido)
  VALUES (NEW.id, COALESCE(full_name, NEW.email), NEW.email, first_name, last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 4. DIAGNOSTIC RESULTS
-- ============================================

CREATE TABLE public.diagnostic_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  perfil TEXT NOT NULL,
  puntaje_total INTEGER NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results" ON public.diagnostic_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own results" ON public.diagnostic_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all diagnostic results" ON public.diagnostic_results FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 5. WALL POSTS
-- ============================================

CREATE TABLE public.wall_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'pending')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved wall posts" ON public.wall_posts FOR SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Users can create wall posts" ON public.wall_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.wall_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wall posts" ON public.wall_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update wall posts" ON public.wall_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 6. WALL LIKES
-- ============================================

CREATE TABLE public.wall_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.wall_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.wall_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like posts" ON public.wall_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.wall_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_wall_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE public.wall_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id; RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN UPDATE public.wall_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id; RETURN OLD;
  END IF; RETURN NULL;
END;
$$;

CREATE TRIGGER sync_wall_likes_count AFTER INSERT OR DELETE ON public.wall_likes FOR EACH ROW EXECUTE FUNCTION public.update_wall_likes_count();

-- ============================================
-- 7. WALL COMMENTS
-- ============================================

CREATE TABLE public.wall_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.wall_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wall_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved wall comments" ON public.wall_comments FOR SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Admins can view all wall comments" ON public.wall_comments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create wall comments" ON public.wall_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.wall_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update wall comments" ON public.wall_comments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_wall_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE public.wall_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id; RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN UPDATE public.wall_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id; RETURN OLD;
  END IF; RETURN NULL;
END;
$$;

CREATE TRIGGER trg_wall_comments_count AFTER INSERT OR DELETE ON public.wall_comments FOR EACH ROW EXECUTE FUNCTION public.update_wall_comments_count();

-- ============================================
-- 8. MODERATION LOG
-- ============================================

CREATE TABLE public.moderation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.wall_posts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation logs" ON public.moderation_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert moderation logs" ON public.moderation_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 9. NOVEDADES
-- ============================================

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

CREATE POLICY "Anyone can view published novedades" ON public.novedades FOR SELECT TO authenticated USING (publicado = true);
CREATE POLICY "Admins can insert novedades" ON public.novedades FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update novedades" ON public.novedades FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete novedades" ON public.novedades FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_novedades_updated_at BEFORE UPDATE ON public.novedades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 10. CONTENT CATEGORIES
-- ============================================

CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  icono TEXT DEFAULT 'BookOpen',
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.content_categories FOR SELECT TO authenticated USING (activa = true);
CREATE POLICY "Admins can manage categories" ON public.content_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- 11. CONTENT POSTS
-- ============================================

CREATE TABLE public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'infographic', 'book')),
  imagen_url TEXT,
  video_url TEXT,
  pdf_url TEXT,
  resumen TEXT,
  fuente TEXT DEFAULT 'ia',
  estado TEXT NOT NULL DEFAULT 'publicado',
  created_by UUID,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts" ON public.content_posts FOR SELECT TO authenticated USING (estado = 'publicado');
CREATE POLICY "Admins can manage all posts" ON public.content_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- 12. CONTENT GUIDELINES
-- ============================================

CREATE TABLE public.content_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.content_categories(id) ON DELETE CASCADE,
  instrucciones TEXT NOT NULL,
  ejemplos TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage guidelines" ON public.content_guidelines FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- 13. ADMIN CONFIG
-- ============================================

CREATE TABLE public.admin_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin config" ON public.admin_config FOR SELECT USING (true);
CREATE POLICY "Only admins can write admin config" ON public.admin_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 14. DATOS INICIALES
-- ============================================

INSERT INTO public.content_categories (nombre, slug, descripcion, icono) VALUES
  ('Tip práctico', 'tip', 'Algo que podés aplicar hoy', 'Lightbulb'),
  ('Estrategia', 'estrategia', 'Una idea para tu negocio', 'FileText'),
  ('Reflexión', 'reflexion', 'Para cuestionar cómo operás', 'Brain'),
  ('Noticia', 'noticia', 'Lo que está pasando', 'Newspaper');

INSERT INTO public.admin_config (key, value) VALUES
  ('admin_username', 'admin'),
  ('master_password_hash', encode(digest('T@beg2301', 'sha256'), 'hex')),
  ('recovery_question_1', '¿Cuál es el nombre de tu primera mascota?'),
  ('recovery_answer_1_hash', encode(digest('mejoraapp', 'sha256'), 'hex')),
  ('recovery_question_2', '¿En qué ciudad naciste?'),
  ('recovery_answer_2_hash', encode(digest('buenosaires', 'sha256'), 'hex')),
  ('recovery_email', 'admin@mejoraapp.com'),
  ('admin_version', '1');

INSERT INTO public.content_posts (titulo, contenido, content_type, video_url, resumen, category_id, estado, fuente, published_at)
SELECT 'Cómo definir tu propuesta de valor en 5 minutos',
  E'La mayoría de los emprendedores caen en el error de querer ser todo para todos.\n\nTu propuesta de valor tiene que responder UNA sola pregunta: ¿por qué alguien te elegiría a vos en vez de a tu competencia?\n\nEjercicio de los 3 filtros:\n1. ¿Qué problema específico resolvés?\n2. ¿Qué hacés diferente?\n3. ¿Por qué debería importarle al cliente?',
  'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Ejercicio de 5 minutos para definir qué te hace único.',
  (SELECT id FROM content_categories WHERE slug='tip'), 'publicado', 'admin', NOW();

INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT 'Los 7 errores que te están fundiendo',
  E'1. No separar finanzas personales del negocio\n2. Fijar precios por competencia\n3. No tener sistema de seguimiento\n4. Reinventar la rueda\n5. No medir nada\n6. Esperar el momento perfecto\n7. No pedir ayuda',
  'infographic', 'https://placehold.co/800x1200/1e40af/ffffff?text=7+Errores',
  'Los 7 errores más comunes de emprendedores argentinos.',
  (SELECT id FROM content_categories WHERE slug='reflexion'), 'publicado', 'ia', NOW();

INSERT INTO public.content_posts (titulo, contenido, content_type, pdf_url, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT 'Guía: Plan de negocios en 12 páginas',
  E'CAP 1 — Visión\nCAP 2 — Mercado\nCAP 3 — Modelo de ingresos\nCAP 4 — Costos reales\nCAP 5 — Proyección 12 meses\nCAP 6 — Plan de acción',
  'book', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf', 'https://placehold.co/400x560/dc2626/ffffff?text=Plan+Negocios',
  'Guía descargable para armar tu primer plan de negocios.',
  (SELECT id FROM content_categories WHERE slug='estrategia'), 'publicado', 'ia', NOW();

INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT 'Dejá de competir por precio. Ahora.',
  E'Cada vez que bajás un precio, le decís al cliente: "no valgo lo que pido".\n\nEl cliente que te elige por precio se va por precio.\n\n¿Qué problema resolvés? ¿Cuánto le cuesta NO resolverlo? Ahí está tu precio.\n\nCobrá por lo que generás, no por lo que hacés.',
  'article', 'https://placehold.co/800x400/0f172a/fbbf24?text=No+compitas+por+precio',
  'Por qué bajar precios es una trampa y cómo fijar valor real.',
  (SELECT id FROM content_categories WHERE slug='estrategia'), 'publicado', 'admin', NOW();

INSERT INTO public.content_posts (titulo, contenido, content_type, video_url, resumen, category_id, estado, fuente, published_at)
SELECT 'Sistema de seguimiento de clientes en 15 minutos',
  E'El 80% de las ventas se cierran entre el 5° y 12° contacto.\n\nTe armamos un sistema con herramientas gratuitas:\n- Google Sheets como CRM\n- Recordatorios automáticos\n- Scripts no-spam',
  'video', 'https://www.youtube.com/embed/jNQXAC9IVRw',
  'CRM básico con herramientas gratis en 15 minutos.',
  (SELECT id FROM content_categories WHERE slug='tip'), 'publicado', 'admin', NOW();

INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT '¿Invertir o ahorrar? Mapa de decisiones',
  E'¿Tenés fondo de emergencia de 3 meses? → SÍ: invertí. → NO: ahorrá.\n¿Retorno en 90 días? → SÍ: priorizala.\n¿Podés medir el resultado? → SÍ: hacela.\n\nRegla: 30% ahorro, 70% inversión medible.',
  'infographic', 'https://placehold.co/800x1000/059669/ffffff?text=Invertir+o+Ahorrar',
  'Mapa para decidir si invertir o ahorrar cada peso.',
  (SELECT id FROM content_categories WHERE slug='tip'), 'publicado', 'ia', NOW();

-- ============================================
-- 15. REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_comments;
