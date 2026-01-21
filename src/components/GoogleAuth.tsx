'use client';

import { useEffect, useState, useCallback } from 'react';

// Hardcoded shared Supabase auth instance
const SUPABASE_URL = 'https://api.srv936332.hstgr.cloud';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NDM0NDU3NywiZXhwIjoxOTU5OTIwNTc3fQ.HDzaau9D7C9G-SAgMrQJ9_5XdVfC4SeoORAg-MXVOEA';
const APP_SLUG = 'ai-chatbot-builder';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface SupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: { user: User } | null } }>;
    signInWithOAuth: (options: { provider: string; options: { redirectTo: string } }) => Promise<{ error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
    onAuthStateChange: (callback: (event: string, session: { user: User } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (column2: string, value2: string) => {
          single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
        };
      };
    };
    upsert: (data: Record<string, unknown>) => Promise<{ error: Error | null }>;
  };
}

declare global {
  interface Window {
    supabase?: {
      createClient: (url: string, key: string) => SupabaseClient;
    };
    AUTH_USER?: User | null;
  }
}

export default function GoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  // Track user login in user_tracking table
  const trackUserLogin = useCallback(async (client: SupabaseClient, userId: string) => {
    try {
      // Check if user exists for this app
      const { data: existing } = await client
        .from('user_tracking')
        .select('login_cnt')
        .eq('user_id', userId)
        .eq('app', APP_SLUG)
        .single();

      if (existing) {
        // Update existing record
        await client.from('user_tracking').upsert({
          user_id: userId,
          app: APP_SLUG,
          login_cnt: (existing.login_cnt as number) + 1,
          last_login_ts: new Date().toISOString(),
        });
      } else {
        // Insert new record
        await client.from('user_tracking').upsert({
          user_id: userId,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error tracking user login:', error);
    }
  }, []);

  // Load Supabase JS dynamically
  useEffect(() => {
    const loadSupabase = async () => {
      if (window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabaseClient(client);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.async = true;
      script.onload = () => {
        if (window.supabase) {
          const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          setSupabaseClient(client);
        }
      };
      document.head.appendChild(script);
    };

    loadSupabase();
  }, []);

  // Handle auth state
  useEffect(() => {
    if (!supabaseClient) return;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          window.AUTH_USER = session.user;
          // Track login on initial load if user is logged in
          await trackUserLogin(supabaseClient, session.user.id);
        } else {
          setUser(null);
          window.AUTH_USER = null;
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          window.AUTH_USER = session.user;
          await trackUserLogin(supabaseClient, session.user.id);
          // Dispatch custom event for other components
          window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: session.user } }));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          window.AUTH_USER = null;
          window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: null } }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient, trackUserLogin]);

  const handleSignIn = async () => {
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Sign in error:', error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    if (!supabaseClient) return;

    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700 hidden sm:block">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
