-- Tarea 4: Membership & Tiendup integration
-- Adds membership_level column and sync tables

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'n0'
    CHECK (membership_level IN ('n0','n1','n2','admin')),
  ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tiendup_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS tiendup_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS last_tiendup_sync TIMESTAMPTZ;

-- membership_expires_at already exists on profiles, skip if so
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS tiendup_sync_log (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  synced_at            TIMESTAMPTZ DEFAULT now(),
  subscriptions_found  INTEGER     DEFAULT 0,
  accounts_updated     INTEGER     DEFAULT 0,
  accounts_downgraded  INTEGER     DEFAULT 0,
  errors               JSONB       DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS membership_activations (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level          TEXT        NOT NULL CHECK (level IN ('n1','n2')),
  activated_by   TEXT        NOT NULL CHECK (activated_by IN ('tiendup_sync','admin','manual')),
  tiendup_sub_id TEXT,
  amount         NUMERIC(12,2),
  currency       TEXT        DEFAULT 'ARS',
  valid_from     TIMESTAMPTZ DEFAULT now(),
  valid_until    TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE membership_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiendup_sync_log       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own activations" ON membership_activations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "No client insert" ON membership_activations
  FOR INSERT WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_profiles_membership    ON profiles(membership_level);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower   ON profiles(lower(email));
CREATE INDEX IF NOT EXISTS idx_activations_user       ON membership_activations(user_id, created_at DESC);
