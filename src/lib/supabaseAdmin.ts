import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side admin client with service role key
// ONLY use this server-side (API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create client only if both URL and key are available
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export function isSupabaseAdminConfigured(): boolean {
  return !!supabaseAdmin;
}
