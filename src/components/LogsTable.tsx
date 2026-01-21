'use client';

import { useState } from 'react';
import type { SimulationLog } from '@/lib/localState';

interface LogsTableProps {
  logs: SimulationLog[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getPlaybookLabel = (playbook: string) => {
    switch (playbook) {
      case 'wismo':
        return 'WISMO';
      case 'cancel':
        return 'Cancel';
      case 'address_change':
        return 'Address Change';
      default:
        return playbook;
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track all simulation runs and their results
          </p>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No simulation logs yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Run your first simulation in the Playground to see logs here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track all simulation runs and their results ({logs.length} total)
        </p>
      </div>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-gray-50">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setExpandedLog(expandedLog === log.id ? null : log.id)
              }
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  {getPlaybookLabel(log.playbook)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                    log.result.status
                  )}`}
                >
                  {log.result.status}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(log.result.confidence * 100)}% confidence
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {formatDate(log.createdAt)}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedLog === log.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600 line-clamp-1">
              {log.ticketText}
            </div>

            {expandedLog === log.id && (
              <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Input Ticket
                  </div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {log.ticketText}
                  </div>
                </div>

                {log.orderJson && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Order Data
                    </div>
                    <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.orderJson, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Suggested Reply
                  </div>
                  <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded whitespace-pre-wrap">
                    {log.result.suggestedReply}
                  </div>
                </div>

                {log.result.citations.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Citations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {log.result.citations.map((citation, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-gray-100 rounded"
                        >
                          {citation.source}: {citation.field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Trace ({log.result.trace.length} steps)
                  </div>
                  <div className="space-y-1">
                    {log.result.trace.map((step, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        <span className="font-medium">Step {step.step}:</span>{' '}
                        {step.action} → {step.result}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
