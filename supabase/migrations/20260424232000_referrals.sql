-- Migration: Referrals table
-- Date: 2026-04-24
-- Sprint: 6.2.2

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referrals (as referrer)
CREATE POLICY "Referrals: usuario ve los propios"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Service role can insert (from Edge Function or signup flow)
CREATE POLICY "Referrals: service_role inserta"
  ON referrals
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can see all
CREATE POLICY "Referrals: admin ve todos"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
