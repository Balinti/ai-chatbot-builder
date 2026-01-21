'use client';

import { useState } from 'react';
import type { PolicyConfig, SimulationResult, SimulationLog } from '@/lib/localState';

interface PlaygroundProps {
  policies: PolicyConfig[];
  onSimulationComplete: (log: SimulationLog) => void;
}

const sampleOrders = {
  shipped: {
    id: 'ORD-12345',
    status: 'fulfilled',
    fulfillment_status: 'shipped',
    customer_email: 'customer@example.com',
    created_at: '2024-01-15T10:00:00Z',
    shipping_address: {
      name: 'John Doe',
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      zip: '10001',
      country: 'US',
    },
    tracking_number: '1Z999AA10123456784',
    tracking_url: 'https://track.example.com/1Z999AA10123456784',
    estimated_delivery: '2024-01-20',
    line_items: [
      { name: 'Premium Widget', quantity: 2, price: 49.99, final_sale: false },
      { name: 'Basic Gadget', quantity: 1, price: 29.99, final_sale: false },
    ],
    total: 129.97,
  },
  pending: {
    id: 'ORD-67890',
    status: 'pending',
    fulfillment_status: 'unfulfilled',
    customer_email: 'customer@example.com',
    created_at: '2024-01-18T14:30:00Z',
    shipping_address: {
      name: 'Jane Smith',
      address1: '456 Oak Ave',
      city: 'Los Angeles',
      province: 'CA',
      zip: '90001',
      country: 'US',
    },
    tracking_number: null,
    tracking_url: null,
    estimated_delivery: null,
    line_items: [
      { name: 'Deluxe Package', quantity: 1, price: 199.99, final_sale: false },
    ],
    total: 199.99,
  },
  final_sale: {
    id: 'ORD-11111',
    status: 'pending',
    fulfillment_status: 'unfulfilled',
    customer_email: 'customer@example.com',
    created_at: '2024-01-18T16:00:00Z',
    shipping_address: {
      name: 'Bob Wilson',
      address1: '789 Pine Rd',
      city: 'Chicago',
      province: 'IL',
      zip: '60601',
      country: 'US',
    },
    tracking_number: null,
    tracking_url: null,
    estimated_delivery: null,
    line_items: [
      { name: 'Clearance Item', quantity: 1, price: 39.99, final_sale: true },
      { name: 'Regular Item', quantity: 1, price: 59.99, final_sale: false },
    ],
    total: 99.98,
  },
};

const sampleTickets = {
  wismo: "Hi, I placed an order last week and I'm wondering when it will arrive? I haven't received any shipping updates. My order number is ORD-12345. Can you please check on this for me? Thanks!",
  cancel: "Hello, I need to cancel my order. I accidentally ordered the wrong item and realized it right after placing the order. Please cancel order ORD-67890 as soon as possible. Thank you.",
  address: "Hi there, I just realized I put the wrong shipping address on my order. Can you please update it? My new address is 123 New Street, Brooklyn, NY 11201. Order number is ORD-67890.",
};

type PlaybookType = 'wismo' | 'cancel' | 'address_change';
type OrderTemplate = 'shipped' | 'pending' | 'final_sale' | 'custom';

export default function Playground({ policies, onSimulationComplete }: PlaygroundProps) {
  const [ticketText, setTicketText] = useState(sampleTickets.wismo);
  const [playbook, setPlaybook] = useState<PlaybookType>('wismo');
  const [orderTemplate, setOrderTemplate] = useState<OrderTemplate>('shipped');
  const [customOrderJson, setCustomOrderJson] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  const handlePlaybookChange = (newPlaybook: PlaybookType) => {
    setPlaybook(newPlaybook);
    setResult(null);

    // Update sample ticket based on playbook
    if (newPlaybook === 'wismo') {
      setTicketText(sampleTickets.wismo);
      setOrderTemplate('shipped');
    } else if (newPlaybook === 'cancel') {
      setTicketText(sampleTickets.cancel);
      setOrderTemplate('pending');
    } else {
      setTicketText(sampleTickets.address);
      setOrderTemplate('pending');
    }
  };

  const getOrderJson = (): Record<string, unknown> | null => {
    if (orderTemplate === 'custom') {
      try {
        return customOrderJson ? JSON.parse(customOrderJson) : null;
      } catch {
        return null;
      }
    }
    return sampleOrders[orderTemplate];
  };

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setResult(null);

    const policy = policies.find((p) => {
      if (playbook === 'wismo') return p.type === 'shipping_eta';
      if (playbook === 'cancel') return p.type === 'cancellations';
      return p.type === 'address_change';
    });

    if (!policy) {
      setIsRunning(false);
      return;
    }

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketText,
          playbook,
          policyJson: policy,
          orderJson: getOrderJson(),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setResult({
          suggestedReply: 'An error occurred while processing your request.',
          confidence: 0,
          citations: [],
          trace: [{ step: 1, action: 'Error', result: data.error }],
          status: 'error',
        });
      } else {
        setResult(data);

        // Create log entry
        const log: SimulationLog = {
          id: `log-${Date.now()}`,
          playbook,
          ticketText,
          orderJson: getOrderJson(),
          result: data,
          createdAt: new Date().toISOString(),
        };

        onSimulationComplete(log);
      }
    } catch (error) {
      setResult({
        suggestedReply: 'Failed to connect to the simulation service.',
        confidence: 0,
        citations: [],
        trace: [{ step: 1, action: 'Error', result: String(error) }],
        status: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'handoff':
        return 'text-yellow-600 bg-yellow-100';
      case 'blocked':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Playground</h2>
        <p className="text-sm text-gray-600 mt-1">
          Test your policies with sample tickets and orders
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Playbook Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Playbook
          </label>
          <div className="flex gap-2">
            {[
              { id: 'wismo', label: 'WISMO', desc: 'Where is my order?' },
              { id: 'cancel', label: 'Cancel', desc: 'Cancel if not fulfilled' },
              { id: 'address_change', label: 'Address', desc: 'Change shipping address' },
            ].map((pb) => (
              <button
                key={pb.id}
                onClick={() => handlePlaybookChange(pb.id as PlaybookType)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  playbook === pb.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{pb.label}</div>
                <div className="text-xs text-gray-500">{pb.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Ticket
          </label>
          <textarea
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Paste a customer support ticket message..."
          />
        </div>

        {/* Order Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Data (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { id: 'shipped', label: 'Shipped Order' },
              { id: 'pending', label: 'Pending Order' },
              { id: 'final_sale', label: 'Final Sale' },
              { id: 'custom', label: 'Custom JSON' },
            ].map((template) => (
              <button
                key={template.id}
                onClick={() => setOrderTemplate(template.id as OrderTemplate)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  orderTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {template.label}
              </button>
            ))}
          </div>

          {orderTemplate === 'custom' ? (
            <textarea
              value={customOrderJson}
              onChange={(e) => setCustomOrderJson(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder='{"id": "ORD-123", "status": "pending", ...}'
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                {JSON.stringify(sampleOrders[orderTemplate], null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Run Button */}
        <button
          onClick={handleRunSimulation}
          disabled={isRunning || !ticketText.trim()}
          className={`w-full py-3 text-sm font-medium rounded-lg transition-colors ${
            isRunning || !ticketText.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Running Simulation...
            </span>
          ) : (
            'Run Simulation'
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  result.status
                )}`}
              >
                {result.status.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(
                  result.confidence
                )}`}
              >
                {Math.round(result.confidence * 100)}% confidence
              </span>
            </div>

            {/* Suggested Reply */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-600 mb-2">
                Suggested Reply
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {result.suggestedReply}
              </div>
            </div>

            {/* Citations */}
            {result.citations.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Citations
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.citations.map((citation, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-white border border-gray-200 rounded"
                    >
                      <span className="text-gray-500">{citation.source}:</span>{' '}
                      {citation.field} = {String(citation.value).substring(0, 30)}
                      {String(citation.value).length > 30 ? '...' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trace */}
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  showTrace ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {showTrace ? 'Hide' : 'Show'} trace ({result.trace.length} steps)
            </button>

            {showTrace && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                {result.trace.map((step, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium text-gray-700">
                      Step {step.step}:
                    </span>{' '}
                    <span className="text-gray-600">{step.action}</span>
                    <span className="text-gray-400"> → </span>
                    <span className="text-gray-800">{step.result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
