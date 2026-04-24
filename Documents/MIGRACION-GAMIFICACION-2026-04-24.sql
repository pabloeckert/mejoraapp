-- ============================================================
-- MIGRACIÓN: Sprint 4.3 — Gamificación, Ranking, Perfil, Contenido Programado
-- Fecha: 2026-04-24
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLA: user_badges — Badges de gamificación
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_slug TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_slug)
);

-- RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read all badges"
  ON user_badges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Index
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_slug ON user_badges(badge_slug);

-- ────────────────────────────────────────────────────────────
-- 2. FUNCIÓN: check_and_award_badges — Otorga badges automáticamente
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_slug TEXT, badge_name TEXT) AS $$
DECLARE
  post_count INT;
  comment_count INT;
  diagnostic_count INT;
  like_count INT;
  days_active INT;
BEGIN
  -- Contar actividad del usuario
  SELECT COUNT(*) INTO post_count
    FROM wall_posts WHERE user_id = p_user_id AND status = 'approved';

  SELECT COUNT(*) INTO comment_count
    FROM wall_comments WHERE user_id = p_user_id AND status = 'approved';

  SELECT COUNT(*) INTO diagnostic_count
    FROM diagnostic_results WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO like_count
    FROM wall_likes WHERE user_id = p_user_id;

  SELECT COUNT(DISTINCT DATE(created_at)) INTO days_active
    FROM (
      SELECT created_at FROM wall_posts WHERE user_id = p_user_id
      UNION ALL
      SELECT created_at FROM wall_comments WHERE user_id = p_user_id
    ) activity;

  -- Badge: primer post
  IF post_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, 'primer-post')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := 'primer-post'; badge_name := 'Primer Post'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: 5 posts
  IF post_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, '5-posts')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := '5-posts'; badge_name := '5 Posts'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: 10 posts
  IF post_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, '10-posts')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := '10-posts'; badge_name := '10 Posts'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: primer comentario
  IF comment_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, 'primer-comentario')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := 'primer-comentario'; badge_name := 'Primer Comentario'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: primer diagnóstico
  IF diagnostic_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, 'primer-diagnostico')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := 'primer-diagnostico'; badge_name := 'Primer Diagnóstico'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: 5 diagnósticos
  IF diagnostic_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, '5-diagnosticos')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := '5-diagnosticos'; badge_name := '5 Diagnósticos'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: 10 likes
  IF like_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, '10-likes')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := '10-likes'; badge_name := '10 Likes'; RETURN NEXT;
    END IF;
  END IF;

  -- Badge: 3 días activos
  IF days_active >= 3 THEN
    INSERT INTO user_badges (user_id, badge_slug)
    VALUES (p_user_id, '3-dias-activo')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
    IF FOUND THEN
      badge_slug := '3-dias-activo'; badge_name := '3 Días Activo'; RETURN NEXT;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 3. VISTA: community_ranking — Top contributors (anónimos)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW community_ranking AS
SELECT
  p.user_id,
  COALESCE(p.display_name, 'Anónimo') AS display_name,
  COALESCE(p.empresa, '') AS empresa,
  COUNT(DISTINCT wp.id) AS post_count,
  COUNT(DISTINCT wc.id) AS comment_count,
  COALESCE(SUM(wp.likes_count), 0) AS total_likes_received,
  COUNT(DISTINCT wp.id) + COUNT(DISTINCT wc.id) + COALESCE(SUM(wp.likes_count), 0) AS activity_score,
  COUNT(DISTINCT ub.badge_slug) AS badge_count
FROM profiles p
LEFT JOIN wall_posts wp ON wp.user_id = p.user_id AND wp.status = 'approved'
LEFT JOIN wall_comments wc ON wc.user_id = p.user_id AND wc.status = 'approved'
LEFT JOIN user_badges ub ON ub.user_id = p.user_id
GROUP BY p.user_id, p.display_name, p.empresa
HAVING COUNT(DISTINCT wp.id) > 0 OR COUNT(DISTINCT wc.id) > 0
ORDER BY activity_score DESC
LIMIT 20;

-- ────────────────────────────────────────────────────────────
-- 4. PERFILES: Campos nuevos (bio, links)
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_badge_earned TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_badge_earned_at TIMESTAMPTZ;

-- ────────────────────────────────────────────────────────────
-- 5. CONTENIDO PROGRAMADO: Campo scheduled_for
-- ────────────────────────────────────────────────────────────
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- ────────────────────────────────────────────────────────────
-- 6. TRIGGER: Otorgar badges automáticamente al publicar post
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_award_badges_on_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_award_badges_on_post ON wall_posts;
CREATE TRIGGER trg_award_badges_on_post
  AFTER INSERT ON wall_posts
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION trigger_award_badges_on_post();

-- ────────────────────────────────────────────────────────────
-- 7. TRIGGER: Otorgar badges automáticamente al comentar
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_award_badges_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_award_badges_on_comment ON wall_comments;
CREATE TRIGGER trg_award_badges_on_comment
  AFTER INSERT ON wall_comments
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION trigger_award_badges_on_comment();

-- ────────────────────────────────────────────────────────────
-- 8. TRIGGER: Otorgar badges automáticamente al completar diagnóstico
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_award_badges_on_diagnostic()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_award_badges_on_diagnostic ON diagnostic_results;
CREATE TRIGGER trg_award_badges_on_diagnostic
  AFTER INSERT ON diagnostic_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_badges_on_diagnostic();

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
