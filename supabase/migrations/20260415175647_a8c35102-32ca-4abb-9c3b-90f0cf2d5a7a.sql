
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
