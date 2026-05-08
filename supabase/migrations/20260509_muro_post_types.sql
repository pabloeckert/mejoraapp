-- ============================================================
-- MIGRACIÓN: Tipos de publicación en el Muro
-- Fecha: 2026-05-09
-- Descripción: Agrega post_type a wall_posts (Consulta/Caso/Convocatoria)
-- ============================================================

-- 1. Crear enum para tipos de post
DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('consulta', 'caso', 'convocatoria');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar columna a wall_posts
ALTER TABLE wall_posts ADD COLUMN IF NOT EXISTS post_type post_type NOT NULL DEFAULT 'consulta';

-- 3. Índice para filtrar por tipo
CREATE INDEX IF NOT EXISTS idx_wall_posts_type ON wall_posts(post_type);

-- 4. Comentarios
COMMENT ON COLUMN wall_posts.post_type IS 'Tipo de publicación: consulta (duda/pregunta), caso (experiencia), convocatoria (propuesta/evento)';
