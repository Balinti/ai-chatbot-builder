'use client';

import { useState, useEffect, useCallback } from 'react';
import PolicyBuilder from '@/components/PolicyBuilder';
import Playground from '@/components/Playground';
import LogsTable from '@/components/LogsTable';
import {
  loadLocalState,
  updatePolicy,
  addSimulationLog,
  type LocalState,
  type PolicyConfig,
  type SimulationLog,
} from '@/lib/localState';

type Tab = 'policies' | 'playground' | 'logs';

export default function AppPage() {
  const [state, setState] = useState<LocalState | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('playground');

  // Load state on mount
  useEffect(() => {
    const localState = loadLocalState();
    setState(localState);
  }, []);

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
    </div>
  );
}
