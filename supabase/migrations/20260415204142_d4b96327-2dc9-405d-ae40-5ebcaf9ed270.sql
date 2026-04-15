
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
