-- AI Chatbot Builder Database Schema
-- This schema is for the app-specific Supabase instance (NOT the shared auth instance)

-- Policy versions table for storing support policy configurations
CREATE TABLE IF NOT EXISTS policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('shipping_eta', 'cancellations', 'address_change')),
  version int NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  policy_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for faster lookups by user and type
CREATE INDEX IF NOT EXISTS idx_policy_versions_user_type ON policy_versions(user_id, type);

-- Automation events table for logging playbook runs
CREATE TABLE IF NOT EXISTS automation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- Nullable for anonymous users (sync later)
  playbook text NOT NULL,
  input_json jsonb NOT NULL,
  output_json jsonb NOT NULL,
  confidence numeric,
  status text NOT NULL CHECK (status IN ('success', 'handoff', 'blocked', 'error')) DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

-- Index for user event lookups
CREATE INDEX IF NOT EXISTS idx_automation_events_user ON automation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_events_created ON automation_events(created_at DESC);

-- User cloud state for syncing localStorage to cloud
CREATE TABLE IF NOT EXISTS user_cloud_state (
  user_id uuid PRIMARY KEY,
  state_json jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table for Stripe billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text,
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
