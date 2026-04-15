
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
