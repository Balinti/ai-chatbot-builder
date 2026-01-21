'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Check if billing is configured via env vars
const hasGrowthPrice = !!process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID;
const hasProPrice = !!process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
const hasBilling = hasGrowthPrice || hasProPrice;

interface User {
  id: string;
  email: string;
}

export default function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth state
    if (typeof window !== 'undefined' && window.AUTH_USER) {
      setUser(window.AUTH_USER);
    }

    const handleAuthChange = (event: CustomEvent<{ user: User | null }>) => {
      setUser(event.detail.user);
    };

    window.addEventListener('auth-change', handleAuthChange as EventListener);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
    };
  }, []);

  const handleSubscribe = async (tier: 'growth' | 'pro') => {
    if (!user) {
      setError('Please sign in to subscribe');
      return;
    }

    setLoading(tier);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          tier,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading('portal');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to open billing portal');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out the platform',
      features: [
        '3 playbook policies',
        '50 simulations/month',
        'Local storage only',
        'Community support',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$29',
      period: '/month',
      description: 'For growing Shopify stores',
      features: [
        'Unlimited policies',
        '500 simulations/month',
        'Cloud sync',
        'Email support',
        'API access',
      ],
      cta: 'Upgrade to Growth',
      disabled: !hasGrowthPrice,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$99',
      period: '/month',
      description: 'For high-volume stores',
      features: [
        'Everything in Growth',
        'Unlimited simulations',
        'Priority support',
        'Shopify integration',
        'Gorgias integration',
        'Custom playbooks',
      ],
      cta: 'Upgrade to Pro',
      disabled: !hasProPrice,
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600">
            Start free and upgrade as you grow
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!hasBilling && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm text-center">
            Billing is not yet configured. Paid plans will be available soon.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border ${
                plan.highlighted
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              } p-6 relative`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
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
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <Link
                  href="/app"
                  className="block w-full py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Go to App
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id as 'growth' | 'pro')}
                  disabled={plan.disabled || loading === plan.id || !user}
                  className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                    plan.disabled || !user
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {loading === plan.id ? (
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : plan.disabled ? (
                    'Coming Soon'
                  ) : !user ? (
                    'Sign in to Subscribe'
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Manage Subscription */}
        {user && (
          <div className="mt-12 text-center">
            <button
              onClick={handleManageSubscription}
              disabled={loading === 'portal'}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {loading === 'portal'
                ? 'Opening portal...'
                : 'Manage existing subscription'}
            </button>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                q: 'Can I try before I buy?',
                a: 'Yes! The free plan lets you test all core features without any payment.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data remains accessible in read-only mode. You can export anytime.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 14-day money-back guarantee on all paid plans.',
              },
              {
                q: 'Can I change plans later?',
                a: 'Absolutely! Upgrade or downgrade anytime from your billing portal.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
