-- Admin master password config table
CREATE TABLE public.admin_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write admin config
CREATE POLICY "Only admins can read admin config"
ON public.admin_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can write admin config"
ON public.admin_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial config
-- Password hash is SHA-256 of "T@beg2301" (lowercased for consistency)
-- Security questions for recovery
INSERT INTO public.admin_config (key, value) VALUES
  ('master_password_hash', encode(digest('T@beg2301', 'sha256'), 'hex')),
  ('recovery_question_1', '¿Cuál es el nombre de tu primera mascota?'),
  ('recovery_answer_1_hash', encode(digest('mejoraapp', 'sha256'), 'hex')),
  ('recovery_question_2', '¿En qué ciudad naciste?'),
  ('recovery_answer_2_hash', encode(digest('buenosaires', 'sha256'), 'hex')),
  ('recovery_email', 'admin@mejoraapp.com'),
  ('admin_version', '1');
