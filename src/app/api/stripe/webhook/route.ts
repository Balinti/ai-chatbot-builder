import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, isStripeConfigured } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    // Return 200 even if not configured to prevent retries
    return NextResponse.json({ received: true, configured: false });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const event = constructWebhookEvent(body, signature);

    if (!event) {
      console.error('Invalid webhook event');
      // Return 200 to prevent retries
      return NextResponse.json({ received: true, error: 'Invalid event' });
    }

    // Handle events only if Supabase is configured
    if (supabaseAdmin) {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } else {
      console.log('Supabase not configured, skipping database updates');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent retries (graceful fallback)
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!supabaseAdmin) return;

  try {
    const userId = session.metadata?.user_id;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      console.error('No user_id in session metadata');
      return;
    }

    // Upsert subscription record
    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    console.log(`Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) return;

  try {
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const priceId = subscription.items.data[0]?.price?.id;
    // Access current_period_end from the subscription object
    const subData = subscription as unknown as { current_period_end?: number };
    const currentPeriodEnd = subData.current_period_end
      ? new Date(subData.current_period_end * 1000).toISOString()
      : null;

    // Find and update subscription by stripe_subscription_id
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status,
        price_id: priceId,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log(`Subscription ${subscriptionId} updated to ${status}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) return;

  try {
    const subscriptionId = subscription.id;

    // Update subscription status to canceled
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error deleting subscription:', error);
    } else {
      console.log(`Subscription ${subscriptionId} canceled`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}
