-- ============================================
-- SECURITY HARDENING - Pre-launch migration
-- Ejecutar en Supabase SQL Editor ANTES de lanzar
-- ============================================

-- 1. Lock down admin_config — only admins can read
DROP POLICY IF EXISTS "Anyone can read admin config" ON public.admin_config;
CREATE POLICY "Only admins can read admin config"
  ON public.admin_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Force wall_posts inserts to pending-only via client
-- (Edge Function moderate-post uses service_role to set approved/rejected)
DROP POLICY IF EXISTS "Users can create wall posts" ON public.wall_posts;
CREATE POLICY "Users can create pending wall posts"
  ON public.wall_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 3. Force wall_comments inserts to pending-only via client
DROP POLICY IF EXISTS "Users can create wall comments" ON public.wall_comments;
CREATE POLICY "Users can create pending wall comments"
  ON public.wall_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 4. Add updated_at trigger to wall_posts
CREATE TRIGGER update_wall_posts_updated_at
  BEFORE UPDATE ON public.wall_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add admin role for the first user (run after first signup)
-- Uncomment and replace YOUR_USER_ID with actual UUID from auth.users
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');

-- 6. Create moderation_comments_log table
CREATE TABLE IF NOT EXISTS public.moderation_comments_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.wall_comments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_comments_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view comment mod logs"
  ON public.moderation_comments_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Notifications table (for push)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  type TEXT DEFAULT 'general',
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. Push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own push subs"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
