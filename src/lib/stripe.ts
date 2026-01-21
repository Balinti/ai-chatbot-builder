import Stripe from 'stripe';

// Server-side Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    })
  : null;

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!stripe;
}

// Price IDs for subscription tiers
export const PRICE_IDS = {
  growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || '',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
};

// Check if billing is fully configured
export function isBillingConfigured(): boolean {
  return !!(stripe && PRICE_IDS.growth && PRICE_IDS.pro);
}

// Create checkout session
export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      app_name: 'ai-chatbot-builder',
      user_id: params.userId,
    },
    subscription_data: {
      metadata: {
        app_name: 'ai-chatbot-builder',
        user_id: params.userId,
      },
    },
  };

  if (params.customerId) {
    sessionParams.customer = params.customerId;
  } else {
    sessionParams.customer_email = params.email;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

// Create customer portal session
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session | null> {
  if (!stripe) return null;

  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

// Construct webhook event
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      console.error('Webhook signature verification failed');
      return null;
    }
  }

  // If no webhook secret, parse without verification (development only)
  try {
    return JSON.parse(payload.toString()) as Stripe.Event;
  } catch {
    return null;
  }
}
