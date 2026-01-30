// Supabase has been removed - database operations are handled via Firebase/Firestore
// This stub keeps existing Stripe webhook routes working (they gracefully handle null)
export const supabaseAdmin = null;

export function isSupabaseAdminConfigured(): boolean {
  return false;
}
