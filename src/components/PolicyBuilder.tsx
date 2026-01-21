'use client';

import { useState } from 'react';
import type { PolicyConfig, PolicyRule } from '@/lib/localState';

interface PolicyBuilderProps {
  policies: PolicyConfig[];
  onUpdatePolicy: (type: PolicyConfig['type'], updates: Partial<PolicyConfig>) => void;
}

export default function PolicyBuilder({ policies, onUpdatePolicy }: PolicyBuilderProps) {
  const [activePolicy, setActivePolicy] = useState<PolicyConfig['type']>('shipping_eta');

  const currentPolicy = policies.find((p) => p.type === activePolicy);

  const handleToggleRule = (ruleId: string) => {
    if (!currentPolicy) return;

    const updatedRules = currentPolicy.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    onUpdatePolicy(activePolicy, { rules: updatedRules });
  };

  const handleUpdateRule = (ruleId: string, field: keyof PolicyRule, value: string) => {
    if (!currentPolicy) return;

    const updatedRules = currentPolicy.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );

    onUpdatePolicy(activePolicy, { rules: updatedRules });
  };

  const handleAddRule = () => {
    if (!currentPolicy) return;

    const newRule: PolicyRule = {
      id: `rule-${Date.now()}`,
      condition: 'New condition',
      action: 'New action',
      enabled: true,
    };

    onUpdatePolicy(activePolicy, {
      rules: [...currentPolicy.rules, newRule],
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!currentPolicy) return;

    const updatedRules = currentPolicy.rules.filter((rule) => rule.id !== ruleId);
    onUpdatePolicy(activePolicy, { rules: updatedRules });
  };

  const policyTabs = [
    { type: 'shipping_eta' as const, label: 'Shipping / WISMO', icon: '📦' },
    { type: 'cancellations' as const, label: 'Cancellations', icon: '❌' },
    { type: 'address_change' as const, label: 'Address Change', icon: '📍' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Policy Builder</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure your support policies to automate common customer requests
        </p>
      </div>

      {/* Policy Tabs */}
      <div className="flex border-b border-gray-200">
        {policyTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActivePolicy(tab.type)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activePolicy === tab.type
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Policy Rules */}
      <div className="p-4">
        {currentPolicy && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{currentPolicy.name}</h3>
              <span className="text-xs text-gray-500">
                {currentPolicy.rules.filter((r) => r.enabled).length} active rules
              </span>
            </div>

            <div className="space-y-3">
              {currentPolicy.rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border ${
                    rule.enabled
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Rule {index + 1} - Condition
                      </div>
                      <input
                        type="text"
                        value={rule.condition}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, 'condition', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Action
                      </div>
                      <input
                        type="text"
                        value={rule.action}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, 'action', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete rule"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddRule}
              className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Add Rule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
