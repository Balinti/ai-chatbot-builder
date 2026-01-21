// Local storage state management for anonymous users

const STORAGE_KEY = 'ai-chatbot-builder-state';
const STORAGE_VERSION = 1;

export interface PolicyConfig {
  type: 'shipping_eta' | 'cancellations' | 'address_change';
  name: string;
  rules: PolicyRule[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface SimulationLog {
  id: string;
  playbook: string;
  ticketText: string;
  orderJson: Record<string, unknown> | null;
  result: SimulationResult;
  createdAt: string;
}

export interface SimulationResult {
  suggestedReply: string;
  confidence: number;
  citations: Citation[];
  trace: TraceStep[];
  status: 'success' | 'handoff' | 'blocked' | 'error';
}

export interface Citation {
  source: string;
  field: string;
  value: string;
}

export interface TraceStep {
  step: number;
  action: string;
  result: string;
}

export interface LocalState {
  version: number;
  policies: PolicyConfig[];
  logs: SimulationLog[];
  meaningfulActionCompleted: boolean;
  hasSeenSavePrompt: boolean;
  guestSessionStartedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Minimum time (in milliseconds) a guest can use the app before being prompted to login
export const GUEST_TRIAL_DURATION_MS = 3 * 60 * 1000; // 3 minutes

const defaultPolicies: PolicyConfig[] = [
  {
    type: 'shipping_eta',
    name: 'Shipping ETA / WISMO Policy',
    rules: [
      {
        id: 'wismo-1',
        condition: 'Order status is "shipped"',
        action: 'Provide tracking link and estimated delivery date',
        enabled: true,
      },
      {
        id: 'wismo-2',
        condition: 'Order status is "processing"',
        action: 'Inform customer order is being prepared, provide expected ship date',
        enabled: true,
      },
      {
        id: 'wismo-3',
        condition: 'Order is delayed beyond expected delivery',
        action: 'Apologize and offer expedited shipping or discount on next order',
        enabled: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    type: 'cancellations',
    name: 'Cancellation Eligibility Policy',
    rules: [
      {
        id: 'cancel-1',
        condition: 'Order status is "unfulfilled" or "pending"',
        action: 'Cancel order immediately and confirm cancellation',
        enabled: true,
      },
      {
        id: 'cancel-2',
        condition: 'Order status is "fulfilled" or "shipped"',
        action: 'Inform customer order cannot be cancelled, offer return instructions',
        enabled: true,
      },
      {
        id: 'cancel-3',
        condition: 'Order contains final sale items',
        action: 'Inform customer final sale items cannot be cancelled or returned',
        enabled: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    type: 'address_change',
    name: 'Address Change Policy',
    rules: [
      {
        id: 'address-1',
        condition: 'Order status is "unfulfilled" or "pending"',
        action: 'Update shipping address and confirm change',
        enabled: true,
      },
      {
        id: 'address-2',
        condition: 'Order status is "fulfilled" or "shipped"',
        action: 'Inform customer address cannot be changed, contact carrier if possible',
        enabled: true,
      },
      {
        id: 'address-3',
        condition: 'New address is in a different country',
        action: 'Require customer to cancel and reorder with correct address',
        enabled: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getDefaultState(): LocalState {
  const now = new Date().toISOString();
  return {
    version: STORAGE_VERSION,
    policies: defaultPolicies,
    logs: [],
    meaningfulActionCompleted: false,
    hasSeenSavePrompt: false,
    guestSessionStartedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadLocalState(): LocalState {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultState = getDefaultState();
      saveLocalState(defaultState);
      return defaultState;
    }

    const parsed = JSON.parse(stored) as LocalState;

    // Handle version migration if needed
    if (parsed.version !== STORAGE_VERSION) {
      return migrateState(parsed);
    }

    // Ensure guestSessionStartedAt exists for older local storage entries
    if (!parsed.guestSessionStartedAt) {
      parsed.guestSessionStartedAt = parsed.createdAt || new Date().toISOString();
      saveLocalState(parsed);
    }

    return parsed;
  } catch {
    const defaultState = getDefaultState();
    saveLocalState(defaultState);
    return defaultState;
  }
}

export function saveLocalState(state: LocalState): void {
  if (typeof window === 'undefined') return;

  try {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save local state:', error);
  }
}

function migrateState(oldState: LocalState): LocalState {
  // Future migrations can be handled here
  const newState = {
    ...getDefaultState(),
    ...oldState,
    version: STORAGE_VERSION,
  };
  saveLocalState(newState);
  return newState;
}

export function updatePolicy(
  state: LocalState,
  policyType: PolicyConfig['type'],
  updates: Partial<PolicyConfig>
): LocalState {
  const newState = { ...state };
  const policyIndex = newState.policies.findIndex((p) => p.type === policyType);

  if (policyIndex !== -1) {
    newState.policies[policyIndex] = {
      ...newState.policies[policyIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  saveLocalState(newState);
  return newState;
}

export function addSimulationLog(state: LocalState, log: SimulationLog): LocalState {
  const newState = {
    ...state,
    logs: [log, ...state.logs].slice(0, 100), // Keep last 100 logs
    meaningfulActionCompleted: true,
  };
  saveLocalState(newState);
  return newState;
}

export function markSavePromptSeen(state: LocalState): LocalState {
  const newState = {
    ...state,
    hasSeenSavePrompt: true,
  };
  saveLocalState(newState);
  return newState;
}

export function clearLocalState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportStateForSync(state: LocalState): Record<string, unknown> {
  return {
    policies: state.policies,
    logs: state.logs,
    createdAt: state.createdAt,
  };
}

export function hasGuestTrialExpired(state: LocalState): boolean {
  const sessionStart = new Date(state.guestSessionStartedAt).getTime();
  const now = Date.now();
  return now - sessionStart >= GUEST_TRIAL_DURATION_MS;
}
