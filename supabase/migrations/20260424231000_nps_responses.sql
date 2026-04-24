-- Migration: NPS survey responses table
-- Date: 2026-04-24
-- Sprint: 6.2.4

CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nps_responses_score ON nps_responses(score);
CREATE INDEX IF NOT EXISTS idx_nps_responses_created_at ON nps_responses(created_at DESC);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own response
CREATE POLICY "NPS: usuario inserta propio"
  ON nps_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can read
CREATE POLICY "NPS: solo admin lee"
  ON nps_responses
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
