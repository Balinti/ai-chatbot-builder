import { NextRequest, NextResponse } from 'next/server';
import { runPlaybook, isAIConfigured } from '@/lib/ai';
import type { PolicyConfig } from '@/lib/localState';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { ticketText, playbook, policyJson, orderJson } = body as {
      ticketText: string;
      playbook: 'wismo' | 'cancel' | 'address_change';
      policyJson: PolicyConfig;
      orderJson: Record<string, unknown> | null;
    };

    if (!ticketText || !playbook || !policyJson) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketText, playbook, policyJson' },
        { status: 400 }
      );
    }

    const result = await runPlaybook({
      ticketText,
      playbook,
      policyJson,
      orderJson,
    });

    return NextResponse.json({
      ...result,
      aiConfigured: isAIConfigured(),
    });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
