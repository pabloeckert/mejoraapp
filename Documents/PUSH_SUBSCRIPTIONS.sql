-- Push Subscriptions table for Web Push Notifications
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscription
CREATE POLICY "Users can read own push subscription"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscription"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscription"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscription"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can read all (for sending notifications)
CREATE POLICY "Admin can read all push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (is_admin(auth.uid()));

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
