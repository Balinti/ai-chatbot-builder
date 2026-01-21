import OpenAI from 'openai';
import type { PolicyConfig, SimulationResult, Citation, TraceStep } from './localState';

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null;

export function isAIConfigured(): boolean {
  return !!openai;
}

interface AIInput {
  ticketText: string;
  playbook: 'wismo' | 'cancel' | 'address_change';
  policyJson: PolicyConfig;
  orderJson: Record<string, unknown> | null;
}

interface ParsedOrder {
  id?: string;
  status?: string;
  fulfillment_status?: string;
  shipping_address?: Record<string, unknown>;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  line_items?: Array<{ name: string; final_sale?: boolean }>;
  created_at?: string;
}

export async function runPlaybook(input: AIInput): Promise<SimulationResult> {
  if (openai) {
    return runWithOpenAI(input);
  }
  return runFallback(input);
}

async function runWithOpenAI(input: AIInput): Promise<SimulationResult> {
  const systemPrompt = `You are a support automation assistant for Shopify brands. Your job is to analyze customer support tickets and generate appropriate responses based on company policies.

IMPORTANT RULES:
1. Only use information from the provided policy and order data
2. Always cite the specific policy rules and order fields you used
3. Be helpful and empathetic to customers
4. If you cannot confidently handle the request, recommend handoff to a human agent
5. Never make up information - only use what's provided

Policy being used:
${JSON.stringify(input.policyJson, null, 2)}

${input.orderJson ? `Order data:\n${JSON.stringify(input.orderJson, null, 2)}` : 'No order data provided - using policy rules only.'}

Respond in JSON format:
{
  "suggested_reply": "Your response to the customer",
  "confidence": 0.0 to 1.0,
  "citations": [{"source": "policy|order", "field": "field name", "value": "actual value used"}],
  "trace": [{"step": 1, "action": "what you checked", "result": "what you found"}],
  "status": "success|handoff|blocked|error"
}`;

  try {
    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Customer ticket:\n${input.ticketText}\n\nPlaybook: ${input.playbook}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      suggestedReply: response.suggested_reply || 'Unable to generate response',
      confidence: typeof response.confidence === 'number' ? response.confidence : 0.5,
      citations: Array.isArray(response.citations) ? response.citations : [],
      trace: Array.isArray(response.trace) ? response.trace : [],
      status: response.status || 'success',
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return runFallback(input);
  }
}

function runFallback(input: AIInput): SimulationResult {
  const order = (input.orderJson || {}) as ParsedOrder;
  const policy = input.policyJson;
  const citations: Citation[] = [];
  const trace: TraceStep[] = [];
  let suggestedReply = '';
  const confidence = 0.35;
  let status: SimulationResult['status'] = 'success';

  // Step 1: Identify playbook
  trace.push({
    step: 1,
    action: `Identified playbook: ${input.playbook}`,
    result: `Using ${policy.name}`,
  });

  // Step 2: Check order status
  const orderStatus = order.fulfillment_status || order.status || 'unknown';
  trace.push({
    step: 2,
    action: 'Checked order status',
    result: `Order status: ${orderStatus}`,
  });

  if (order.status) {
    citations.push({
      source: 'order',
      field: 'status',
      value: orderStatus,
    });
  }

  // Generate response based on playbook
  switch (input.playbook) {
    case 'wismo':
      suggestedReply = generateWISMOResponse(order, policy, citations, trace);
      break;
    case 'cancel':
      suggestedReply = generateCancelResponse(order, policy, citations, trace, (s) => { status = s; });
      break;
    case 'address_change':
      suggestedReply = generateAddressChangeResponse(order, policy, citations, trace, (s) => { status = s; });
      break;
    default:
      suggestedReply = 'I apologize, but I need to transfer you to a team member who can better assist with your request.';
      status = 'handoff';
  }

  // Final step
  trace.push({
    step: trace.length + 1,
    action: 'Generated response',
    result: `Status: ${status}, Confidence: ${confidence}`,
  });

  return {
    suggestedReply,
    confidence,
    citations,
    trace,
    status,
  };
}

function generateWISMOResponse(
  order: ParsedOrder,
  policy: PolicyConfig,
  citations: Citation[],
  trace: TraceStep[]
): string {
  const status = order.fulfillment_status || order.status || 'processing';

  trace.push({
    step: trace.length + 1,
    action: 'Checking WISMO policy rules',
    result: `Found ${policy.rules.filter(r => r.enabled).length} active rules`,
  });

  citations.push({
    source: 'policy',
    field: 'type',
    value: 'shipping_eta',
  });

  if (status === 'shipped' || status === 'fulfilled') {
    const trackingUrl = order.tracking_url || order.tracking_number;
    const delivery = order.estimated_delivery;

    if (trackingUrl) {
      citations.push({ source: 'order', field: 'tracking_url', value: String(trackingUrl) });
    }
    if (delivery) {
      citations.push({ source: 'order', field: 'estimated_delivery', value: delivery });
    }

    return `Hi there! Great news - your order has shipped! 📦

${trackingUrl ? `You can track your package here: ${trackingUrl}` : 'Your tracking information will be available soon.'}

${delivery ? `Expected delivery: ${delivery}` : 'Estimated delivery is typically 3-7 business days from shipment.'}

Is there anything else I can help you with?`;
  }

  if (status === 'processing' || status === 'pending' || status === 'unfulfilled') {
    return `Hi there! Thanks for reaching out about your order.

Your order is currently being processed and prepared for shipment. Orders typically ship within 1-2 business days.

Once your order ships, you'll receive an email with tracking information. You can also check your order status anytime in your account.

Is there anything else I can help you with?`;
  }

  return `Hi there! I'd be happy to help you with your order status.

Let me look into this for you. Based on our records, your order is in "${status}" status.

If you have any specific questions or concerns, please let me know and I'll do my best to assist you!`;
}

function generateCancelResponse(
  order: ParsedOrder,
  policy: PolicyConfig,
  citations: Citation[],
  trace: TraceStep[],
  setStatus: (s: SimulationResult['status']) => void
): string {
  const status = order.fulfillment_status || order.status || 'unknown';

  trace.push({
    step: trace.length + 1,
    action: 'Checking cancellation eligibility',
    result: `Order status: ${status}`,
  });

  citations.push({
    source: 'policy',
    field: 'type',
    value: 'cancellations',
  });

  // Check for final sale items
  const hasFinalSale = order.line_items?.some(item => item.final_sale);
  if (hasFinalSale) {
    citations.push({
      source: 'order',
      field: 'line_items.final_sale',
      value: 'true',
    });
  }

  if (status === 'unfulfilled' || status === 'pending' || status === 'processing') {
    if (hasFinalSale) {
      return `Hi there! I understand you'd like to cancel your order.

I can see your order contains final sale items. Per our policy, final sale items cannot be cancelled or returned.

However, I can help you cancel the non-final-sale items if you'd like. Would you like me to proceed with a partial cancellation?

Alternatively, I can connect you with a team member who may be able to help explore other options.`;
    }

    return `Hi there! I'd be happy to help you cancel your order.

Good news - your order hasn't shipped yet, so I can process the cancellation for you right away.

[SIMULATED: In a live environment, the cancellation would be processed automatically]

You'll receive a confirmation email shortly, and your refund will be processed within 5-10 business days.

Is there anything else I can help you with?`;
  }

  if (status === 'shipped' || status === 'fulfilled') {
    setStatus('blocked');
    return `Hi there! I understand you'd like to cancel your order.

Unfortunately, your order has already shipped, so we're unable to cancel it at this point.

However, you can return the items once they arrive! Here's what to do:
1. Wait for your package to arrive
2. Visit our returns portal at [your returns URL]
3. Follow the instructions to initiate a return

Alternatively, you can refuse the package upon delivery, and it will be returned to us automatically.

Is there anything else I can help you with?`;
  }

  setStatus('handoff');
  return `Hi there! I understand you'd like to cancel your order.

I need to check a few things to help you with this request. Let me connect you with a team member who can look into this further and assist you directly.

Thank you for your patience!`;
}

function generateAddressChangeResponse(
  order: ParsedOrder,
  policy: PolicyConfig,
  citations: Citation[],
  trace: TraceStep[],
  setStatus: (s: SimulationResult['status']) => void
): string {
  const status = order.fulfillment_status || order.status || 'unknown';

  trace.push({
    step: trace.length + 1,
    action: 'Checking address change eligibility',
    result: `Order status: ${status}`,
  });

  citations.push({
    source: 'policy',
    field: 'type',
    value: 'address_change',
  });

  if (status === 'unfulfilled' || status === 'pending' || status === 'processing') {
    return `Hi there! I'd be happy to help you update your shipping address.

Good news - your order hasn't shipped yet, so I can update the address for you.

[SIMULATED: In a live environment, the address would be updated automatically]

Please provide your new shipping address in the following format:
- Street Address
- City, State/Province
- Postal/ZIP Code
- Country

Once I have the new address, I'll update it right away and send you a confirmation!`;
  }

  if (status === 'shipped' || status === 'fulfilled') {
    setStatus('blocked');
    const trackingUrl = order.tracking_url || order.tracking_number;

    return `Hi there! I understand you'd like to change your shipping address.

Unfortunately, your order has already shipped, so we're unable to update the address in our system.

However, you may have some options:
${trackingUrl ? `1. Track your package here: ${trackingUrl}` : '1. Check your shipping confirmation email for tracking'}
2. Contact the carrier directly to request a hold or redirect (fees may apply)
3. If the package is returned to us, we can reship to your new address

Would you like me to help with any of these options?`;
  }

  setStatus('handoff');
  return `Hi there! I understand you'd like to update your shipping address.

Let me connect you with a team member who can look into the current status of your order and help you with this request.

Thank you for your patience!`;
}
