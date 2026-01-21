import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-6">
            For Shopify Brands
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Support Policies into
            <span className="text-blue-600"> Safe, Testable Playbooks</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI-powered Support Copilot that automates WISMO, cancellations, and address changes
            with full audit trails and confidence scoring. No signup required to try.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Try it now - No signup required
            </Link>
            <Link
              href="/app"
              className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Sign in to save & sync
            </Link>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-sm text-gray-500">AI Chatbot Builder</span>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Ticket</h4>
                  <p className="text-sm text-gray-800">
                    &quot;Hi, I placed an order last week and I&apos;m wondering when it will arrive?
                    I haven&apos;t received any shipping updates...&quot;
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-600 mb-2">AI Response (92% confidence)</h4>
                  <p className="text-sm text-gray-800">
                    &quot;Hi there! Great news - your order has shipped! You can track your
                    package at [tracking link]. Estimated delivery: Jan 20th...&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Three Playbooks, One Powerful Platform
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '📦',
              title: 'WISMO (Where Is My Order)',
              description:
                'Automatically handle shipping inquiries with real-time order status, tracking links, and delivery estimates.',
            },
            {
              icon: '❌',
              title: 'Cancel-if-not-Fulfilled',
              description:
                'Smart cancellation handling based on fulfillment status, with automatic eligibility checking and refund initiation.',
            },
            {
              icon: '📍',
              title: 'Address Change',
              description:
                'Process address update requests intelligently based on order status and shipping carrier capabilities.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Configure Policies',
                description: 'Set up your support rules for each playbook type.',
              },
              {
                step: '2',
                title: 'Test in Playground',
                description: 'Simulate tickets against your policies before going live.',
              },
              {
                step: '3',
                title: 'Review Audit Logs',
                description: 'Track every decision with full transparency.',
              },
              {
                step: '4',
                title: 'Deploy with Confidence',
                description: 'Connect to Shopify and Gorgias (coming soon).',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔒',
              title: 'Audit Trail',
              description: 'Every AI decision is logged with citations and reasoning.',
            },
            {
              icon: '🎯',
              title: 'Confidence Scoring',
              description: 'Know when to trust AI and when to escalate to humans.',
            },
            {
              icon: '⚡',
              title: 'Instant Setup',
              description: 'Start testing in under 5 minutes, no signup required.',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Automate Your Support?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            No credit card required. Start building playbooks in minutes.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-colors"
          >
            Try it now - Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold text-white">AI Chatbot Builder</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/billing" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; {new Date().getFullYear()} AI Chatbot Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
