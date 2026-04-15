
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
