'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function IntegrationsPage() {
  const [simulationMode, setSimulationMode] = useState(true);

  const integrations = [
    {
      id: 'shopify',
      name: 'Shopify',
      logo: '🛍️',
      description: 'Connect your Shopify store to access real order data and automate actions.',
      status: 'coming_soon' as const,
      features: [
        'Real-time order lookup',
        'Automatic cancellations',
        'Address updates',
        'Refund processing',
      ],
    },
    {
      id: 'gorgias',
      name: 'Gorgias',
      logo: '💬',
      description: 'Integrate with Gorgias to automatically handle support tickets.',
      status: 'coming_soon' as const,
      features: [
        'Ticket auto-response',
        'Tag and route tickets',
        'Customer history',
        'Macro suggestions',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Integrations</h1>
          <p className="text-lg text-gray-600">
            Connect your tools to power real automation
          </p>
        </div>

        {/* Simulation Mode Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Simulation Mode</h3>
              <p className="text-sm text-blue-700">
                Test playbooks with sample data without connecting real accounts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulationMode}
                onChange={(e) => setSimulationMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="space-y-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{integration.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{integration.description}</p>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {integration.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    disabled
                    className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Want early access to integrations?
          </h2>
          <p className="text-blue-100 mb-6">
            Join our waitlist to be notified when Shopify and Gorgias integrations launch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-64 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="w-full sm:w-auto px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
              Join Waitlist
            </button>
          </div>
        </div>

        {/* Back to App */}
        <div className="mt-8 text-center">
          <Link
            href="/app"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
