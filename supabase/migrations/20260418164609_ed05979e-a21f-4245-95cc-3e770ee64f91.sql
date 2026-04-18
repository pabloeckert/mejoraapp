
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
