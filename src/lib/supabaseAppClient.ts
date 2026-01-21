import { createClient, SupabaseClient } from '@supabase/supabase-js';

// App-specific Supabase client for data storage
// Uses project-specific env vars (NOT the shared auth instance)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if both URL and key are available
export const supabaseApp: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Type definitions for app tables
export interface PolicyVersion {
  id: string;
  user_id: string;
  type: 'shipping_eta' | 'cancellations' | 'address_change';
  version: number;
  status: 'draft' | 'published';
  policy_json: Record<string, unknown>;
  created_at: string;
}

export interface AutomationEvent {
  id: string;
  user_id: string | null;
  playbook: string;
  input_json: Record<string, unknown>;
  output_json: Record<string, unknown>;
  confidence: number | null;
  status: 'success' | 'handoff' | 'blocked' | 'error';
  created_at: string;
}

export interface UserCloudState {
  user_id: string;
  state_json: Record<string, unknown>;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string | null;
  price_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}
