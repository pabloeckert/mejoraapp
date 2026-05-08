-- ============================================================
-- MIGRACIÓN: Business Mirror Gamer
-- Fecha: 2026-05-09
-- Descripción: Tablas para el sistema de tests/gamificación
-- ============================================================

-- 1. Catálogo de tests
CREATE TABLE IF NOT EXISTS business_mirror_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,           -- "mirror-estrategico", "mision-rescate", etc.
  title text NOT NULL,                  -- "Mirror Estratégico"
  subtitle text,                        -- "Descubrí tu perfil de empresario"
  description text,                     -- Descripción larga
  category text NOT NULL,               -- "diagnostico", "puzzle", "aventura", "mental", "logica"
  icon text,                            -- Nombre del icono (lucide)
  color text,                           -- Color hex del tema
  bg_color text,                        -- Color de fondo
  min_access_level access_level NOT NULL DEFAULT 'N1',
  game_type text NOT NULL DEFAULT 'classic', -- "classic", "puzzle", "adventure", "mental", "logic"
  time_estimate_min integer DEFAULT 5,  -- Tiempo estimado en minutos
  questions jsonb NOT NULL,             -- Array de preguntas/escenarios
  scoring_rules jsonb,                  -- Reglas de cálculo de perfil
  profiles jsonb,                       -- Perfiles posibles con sus resultados
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Resultados de cada usuario
CREATE TABLE IF NOT EXISTS business_mirror_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES business_mirror_tests(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,               -- Respuestas del usuario
  score integer,                        -- Puntaje calculado
  profile text,                         -- Perfil resultante (ej: "SATURADO")
  profile_data jsonb,                   -- Datos completos del perfil
  time_spent_seconds integer,           -- Tiempo que tardó
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, test_id, completed_at) -- Permite repetir tests
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_bmt_active ON business_mirror_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_bmt_category ON business_mirror_tests(category);
CREATE INDEX IF NOT EXISTS idx_bmt_access ON business_mirror_tests(min_access_level);
CREATE INDEX IF NOT EXISTS idx_bmr_user ON business_mirror_results(user_id);
CREATE INDEX IF NOT EXISTS idx_bmr_test ON business_mirror_results(test_id);
CREATE INDEX IF NOT EXISTS idx_bmr_completed ON business_mirror_results(completed_at);

-- 4. RLS
ALTER TABLE business_mirror_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_mirror_results ENABLE ROW LEVEL SECURITY;

-- Tests: todos pueden ver los activos
CREATE POLICY "bmt_select" ON business_mirror_tests FOR SELECT USING (is_active = true);

-- Results: usuario ve los suyos, admin ve todos
CREATE POLICY "bmr_select_own" ON business_mirror_results FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bmr_insert_own" ON business_mirror_results FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- 5. Trigger updated_at
CREATE TRIGGER update_bmt_updated_at BEFORE UPDATE ON business_mirror_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Comentarios
COMMENT ON TABLE business_mirror_tests IS 'Catálogo de tests del Business Mirror Gamer';
COMMENT ON TABLE business_mirror_results IS 'Resultados de tests completados por usuarios';
COMMENT ON COLUMN business_mirror_tests.game_type IS 'Tipo de juego: classic (preguntas), puzzle, adventure, mental, logic';
COMMENT ON COLUMN business_mirror_tests.questions IS 'Estructura varía según game_type';
COMMENT ON COLUMN business_mirror_tests.scoring_rules IS 'Reglas para calcular perfil según respuestas';
