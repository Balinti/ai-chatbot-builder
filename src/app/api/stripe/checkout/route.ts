import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, isStripeConfigured, PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { userId, email, tier } = body as {
      userId: string;
      email: string;
      tier: 'growth' | 'pro';
    };

    if (!userId || !email || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, tier' },
        { status: 400 }
      );
    }

    const priceId = tier === 'growth' ? PRICE_IDS.growth : PRICE_IDS.pro;

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for ${tier} tier is not configured` },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      userId,
      email,
      priceId,
      successUrl: `${appUrl}/billing?success=true`,
      cancelUrl: `${appUrl}/billing?canceled=true`,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
