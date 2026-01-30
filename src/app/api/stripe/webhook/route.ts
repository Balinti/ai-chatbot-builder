import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, isStripeConfigured } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ received: true, configured: false });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const event = constructWebhookEvent(body, signature);

    if (!event) {
      console.error('Invalid webhook event');
      return NextResponse.json({ received: true, error: 'Invalid event' });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout completed for user ${session.metadata?.user_id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} updated to ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} canceled`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}
