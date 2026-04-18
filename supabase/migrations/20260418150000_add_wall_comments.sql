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
