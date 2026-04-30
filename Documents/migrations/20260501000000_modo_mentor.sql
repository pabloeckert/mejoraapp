-- ============================================================
-- MODO MENTOR — Migración SQL
-- Fecha: 2026-05-01
-- Descripción: Tablas para el sistema de Mentor IA integrado
-- ============================================================

-- 1. Conversaciones del mentor
CREATE TABLE IF NOT EXISTS public.mentor_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva consulta',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- 2. Mensajes del mentor
CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Configuración del mentor (admin)
CREATE TABLE IF NOT EXISTS public.mentor_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mentor_conversations_user ON public.mentor_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_conversation ON public.mentor_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_user ON public.mentor_messages(user_id, created_at DESC);

-- RLS
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_config ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios ven sus propias conversaciones
CREATE POLICY "Users can view own conversations"
  ON public.mentor_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.mentor_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.mentor_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.mentor_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies: usuarios ven sus propios mensajes
CREATE POLICY "Users can view own messages"
  ON public.mentor_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON public.mentor_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: admin puede ver config
CREATE POLICY "Admin can manage mentor config"
  ON public.mentor_config FOR ALL
  USING (public.is_admin(auth.uid()));

-- Service role puede leer config (para Edge Functions)
CREATE POLICY "Service role can read mentor config"
  ON public.mentor_config FOR SELECT
  USING (true);

-- Trigger: actualizar updated_at en conversaciones
CREATE OR REPLACE FUNCTION public.update_mentor_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.mentor_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mentor_message_created
  AFTER INSERT ON public.mentor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mentor_conversation_timestamp();

-- Configuración inicial del mentor
INSERT INTO public.mentor_config (key, value, description) VALUES
  ('system_prompt', 'Sos el Mentor IA de Mejora Continua, una comunidad de líderes empresariales argentinos. Tu rol es ser un mentor de negocios personalizado.

REGLAS:
- Respondé siempre en español argentino con voseo
- Sé directo, práctico y accionable
- Basá tus respuestas en el contexto del usuario (empresa, cargo, industria, resultado Mirror)
- Cuando sea posible, sugerí contenido de la plataforma o pasos concretos
- No inventes datos — si no tenés información, pedila
- Mantené un tono profesional pero cercano, como un mentor experimentado
- Limitá tus respuestas a 200 palabras máximo para mantener el chat ágil
- Si el usuario pregunta algo fuera del ámbito de negocios, redirigilo amablemente

CONTEXTO DEL USUARIO:
{user_context}

CONVERSACIÓN ANTERIOR:
{conversation_history}', 'System prompt del Mentor IA'),
  ('max_messages_per_minute', '20', 'Límite de mensajes por minuto por usuario'),
  ('max_conversations_per_user', '50', 'Máximo de conversaciones por usuario'),
  ('max_context_messages', '10', 'Mensajes de historial incluidos en contexto'),
  ('enabled', 'true', 'Mentor habilitado globalmente')
ON CONFLICT (key) DO NOTHING;

-- Vista: estadísticas del mentor para admin
CREATE OR REPLACE VIEW public.mentor_stats AS
SELECT
  COUNT(DISTINCT mc.user_id) as total_users,
  COUNT(DISTINCT mc.id) as total_conversations,
  COUNT(mm.id) as total_messages,
  COUNT(DISTINCT mc.user_id) FILTER (WHERE mc.updated_at > now() - interval '24 hours') as active_users_24h,
  COUNT(DISTINCT mc.user_id) FILTER (WHERE mc.updated_at > now() - interval '7 days') as active_users_7d,
  AVG(subquery.message_count) as avg_messages_per_conversation
FROM public.mentor_conversations mc
LEFT JOIN public.mentor_messages mm ON mm.conversation_id = mc.id
LEFT JOIN (
  SELECT conversation_id, COUNT(*) as message_count
  FROM public.mentor_messages
  GROUP BY conversation_id
) subquery ON subquery.conversation_id = mc.id;
