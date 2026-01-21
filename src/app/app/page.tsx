'use client';

import { useState, useEffect, useCallback } from 'react';
import PolicyBuilder from '@/components/PolicyBuilder';
import Playground from '@/components/Playground';
import LogsTable from '@/components/LogsTable';
import SoftSavePrompt from '@/components/SoftSavePrompt';
import {
  loadLocalState,
  saveLocalState,
  updatePolicy,
  addSimulationLog,
  markSavePromptSeen,
  exportStateForSync,
  hasGuestTrialExpired,
  GUEST_TRIAL_DURATION_MS,
  type LocalState,
  type PolicyConfig,
  type SimulationLog,
} from '@/lib/localState';
import { supabaseApp } from '@/lib/supabaseAppClient';

type Tab = 'policies' | 'playground' | 'logs';

export default function AppPage() {
  const [state, setState] = useState<LocalState | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('playground');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'synced' | 'error'>('idle');
  const [trialExpired, setTrialExpired] = useState(false);

  // Load state on mount
  useEffect(() => {
    const localState = loadLocalState();
    setState(localState);
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent<{ user: { id: string; email: string } | null }>) => {
      setUser(event.detail.user);
    };

    // Check initial state
    if (typeof window !== 'undefined' && window.AUTH_USER) {
      setUser(window.AUTH_USER);
    }

    window.addEventListener('auth-change', handleAuthChange as EventListener);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
    };
  }, []);

  // Check guest trial expiration periodically
  useEffect(() => {
    if (!state || user) return;

    // Check immediately
    if (hasGuestTrialExpired(state)) {
      setTrialExpired(true);
      return;
    }

    // Set up interval to check every 10 seconds
    const interval = setInterval(() => {
      if (hasGuestTrialExpired(state)) {
        setTrialExpired(true);
        clearInterval(interval);
      }
    }, 10000);

    // Also set a timeout for the exact expiration time
    const sessionStart = new Date(state.guestSessionStartedAt).getTime();
    const timeUntilExpiry = GUEST_TRIAL_DURATION_MS - (Date.now() - sessionStart);

    if (timeUntilExpiry > 0) {
      const timeout = setTimeout(() => {
        setTrialExpired(true);
      }, timeUntilExpiry);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => clearInterval(interval);
  }, [state, user]);

  // Show save prompt after trial expires AND meaningful action (if not logged in)
  useEffect(() => {
    if (
      state?.meaningfulActionCompleted &&
      !state?.hasSeenSavePrompt &&
      !user &&
      trialExpired
    ) {
      // Delay showing the prompt a bit
      const timeout = setTimeout(() => {
        setShowSavePrompt(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [state?.meaningfulActionCompleted, state?.hasSeenSavePrompt, user, trialExpired]);

  const handleUpdatePolicy = useCallback(
    (type: PolicyConfig['type'], updates: Partial<PolicyConfig>) => {
      if (!state) return;
      const newState = updatePolicy(state, type, updates);
      setState(newState);
    },
    [state]
  );

  const handleSimulationComplete = useCallback(
    (log: SimulationLog) => {
      if (!state) return;
      const newState = addSimulationLog(state, log);
      setState(newState);
    },
    [state]
  );

  const handleDismissSavePrompt = useCallback(() => {
    if (!state) return;
    const newState = markSavePromptSeen(state);
    setState(newState);
    setShowSavePrompt(false);
  }, [state]);

  const handleSyncToCloud = async () => {
    if (!user || !state || !supabaseApp) return;

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      const stateToSync = exportStateForSync(state);

      const { error } = await supabaseApp
        .from('user_cloud_state')
        .upsert({
          user_id: user.id,
          state_json: stateToSync,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!user || !supabaseApp) return;

    setIsSyncing(true);

    try {
      const { data, error } = await supabaseApp
        .from('user_cloud_state')
        .select('state_json')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          setSyncStatus('idle');
          return;
        }
        throw error;
      }

      if (data?.state_json) {
        const cloudState = data.state_json as Partial<LocalState>;
        const newState: LocalState = {
          ...loadLocalState(),
          policies: cloudState.policies || state?.policies || [],
          logs: cloudState.logs || state?.logs || [],
        };
        saveLocalState(newState);
        setState(newState);
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Load error:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'playground' as const, label: 'Playground', icon: '🎮' },
    { id: 'policies' as const, label: 'Policies', icon: '📋' },
    { id: 'logs' as const, label: 'Audit Logs', icon: '📊', count: state.logs.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Sync Controls - only show if Supabase is configured */}
            {user && supabaseApp && (
              <div className="flex items-center gap-2">
                {syncStatus === 'synced' && (
                  <span className="text-xs text-green-600">Synced</span>
                )}
                {syncStatus === 'error' && (
                  <span className="text-xs text-red-600">Sync failed</span>
                )}
                <button
                  onClick={handleSyncToCloud}
                  disabled={isSyncing}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Save to Cloud'}
                </button>
                <button
                  onClick={handleLoadFromCloud}
                  disabled={isSyncing}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Load from Cloud
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'playground' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Playground
              policies={state.policies}
              onSimulationComplete={handleSimulationComplete}
            />
            <div className="space-y-6">
              <PolicyBuilder
                policies={state.policies}
                onUpdatePolicy={handleUpdatePolicy}
              />
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="max-w-2xl mx-auto">
            <PolicyBuilder
              policies={state.policies}
              onUpdatePolicy={handleUpdatePolicy}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-4xl mx-auto">
            <LogsTable logs={state.logs} />
          </div>
        )}
      </div>

      {/* Soft Save Prompt */}
      {showSavePrompt && !user && (
        <SoftSavePrompt onDismiss={handleDismissSavePrompt} />
      )}
    </div>
  );
}
