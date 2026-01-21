-- Row Level Security Policies for AI Chatbot Builder
-- Enable RLS on all tables

ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cloud_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy versions: users can only access their own policies
CREATE POLICY "Users can view own policies"
  ON policy_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own policies"
  ON policy_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own policies"
  ON policy_versions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own policies"
  ON policy_versions FOR DELETE
  USING (auth.uid() = user_id);

-- Automation events: users can access their own events
CREATE POLICY "Users can view own events"
  ON automation_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own events"
  ON automation_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own events"
  ON automation_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON automation_events FOR DELETE
  USING (auth.uid() = user_id);

-- User cloud state: users can only access their own state
CREATE POLICY "Users can view own cloud state"
  ON user_cloud_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cloud state"
  ON user_cloud_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cloud state"
  ON user_cloud_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cloud state"
  ON user_cloud_state FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions: users can view their own, server updates via service role
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: INSERT/UPDATE/DELETE for subscriptions should be done via service role (server-side)
-- to ensure Stripe webhook integrity
