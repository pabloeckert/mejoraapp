-- Migration: Modo Comunidad — Public profiles and community features
-- Date: 2026-04-30
-- Description: Adds community_visibility, public_profiles view, community_challenges table

-- 1. Add community fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS community_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF EXISTS bio TEXT; -- may already exist

-- 2. Create index for community directory queries
CREATE INDEX IF NOT EXISTS idx_profiles_community_visible
  ON profiles(community_visible)
  WHERE community_visible = true;

-- 3. Public profiles view (safe — no email, no phone, no user_id)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  p.id,
  p.nombre,
  p.apellido,
  p.display_name,
  p.empresa,
  p.cargo,
  p.bio,
  p.city,
  p.industry,
  p.linkedin,
  p.avatar_url,
  p.community_visible,
  COALESCE(badge_counts.badge_count, 0) AS badge_count,
  COALESCE(post_counts.post_count, 0) AS post_count,
  COALESCE(like_counts.total_likes, 0) AS total_likes
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) AS badge_count
  FROM user_badges
  GROUP BY user_id
) badge_counts ON badge_counts.user_id = p.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS post_count
  FROM wall_posts
  WHERE status = 'approved'
  GROUP BY user_id
) post_counts ON post_counts.user_id = p.user_id
LEFT JOIN (
  SELECT wp.user_id, SUM(wp.likes_count) AS total_likes
  FROM wall_posts wp
  WHERE wp.status = 'approved'
  GROUP BY wp.user_id
) like_counts ON like_counts.user_id = p.user_id
WHERE p.community_visible = true;

-- 4. RLS for public_profiles view
-- Views inherit RLS from underlying tables, but we grant SELECT to authenticated
GRANT SELECT ON public_profiles TO authenticated;

-- 5. Community challenges table
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'weekly', -- weekly, monthly, special
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Challenge participation table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT, -- optional submission content
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- 7. RLS for challenges
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Everyone can read active challenges
CREATE POLICY "Anyone can read active challenges"
  ON community_challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admin can manage challenges
CREATE POLICY "Admin can manage challenges"
  ON community_challenges FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Users can read all challenge participants
CREATE POLICY "Authenticated can read participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (true);

-- Users can join challenges
CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave challenges
CREATE POLICY "Users can leave challenges"
  ON challenge_participants FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 8. Update participant count trigger
CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_challenges
    SET participant_count = participant_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_challenges
    SET participant_count = participant_count - 1
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_challenge_participant_change ON challenge_participants;
CREATE TRIGGER on_challenge_participant_change
  AFTER INSERT OR DELETE ON challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_participant_count();

-- 9. Insert first community challenge
INSERT INTO community_challenges (title, description, challenge_type, end_date)
VALUES (
  'Compartí tu mayor aprendizaje del mes',
  'Contá qué aprendiste este mes que cambió tu perspectiva de negocio. Las mejores historias se destacan en la comunidad.',
  'weekly',
  now() + INTERVAL '7 days'
) ON CONFLICT DO NOTHING;
