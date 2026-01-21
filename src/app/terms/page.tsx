import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600">
                By accessing or using AI Chatbot Builder, you agree to be bound by
                these Terms of Service. If you do not agree to these terms, please
                do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-600">
                AI Chatbot Builder provides a workflow-first Support Copilot demo for
                Shopify brands that turns support policies into safe, testable playbooks
                with audit logs and optional subscription features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-600 mb-4">
                The service can be used without an account. Optional Google
                authentication enables:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Cloud synchronization of your data</li>
                <li>Access to premium features (with subscription)</li>
                <li>Persistent storage across devices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. User Responsibilities
              </h2>
              <p className="text-gray-600 mb-4">You agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate information when creating policies</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Not misuse or attempt to disrupt the service</li>
                <li>Review AI-generated responses before using them</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. AI-Generated Content
              </h2>
              <p className="text-gray-600">
                Our service uses AI to generate suggested responses. These suggestions
                are provided as-is and should be reviewed before use. We do not
                guarantee the accuracy or appropriateness of AI-generated content.
                You are responsible for reviewing and approving all responses sent
                to customers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Subscriptions and Payments
              </h2>
              <p className="text-gray-600 mb-4">
                Paid subscriptions are processed through Stripe. By subscribing:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You authorize recurring charges to your payment method</li>
                <li>Subscriptions renew automatically unless cancelled</li>
                <li>Refunds are available within 14 days of purchase</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-gray-600">
                You retain ownership of your policies and configurations. We retain
                ownership of the service, including all software, designs, and
                documentation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-gray-600">
                To the maximum extent permitted by law, we shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages,
                including loss of profits, data, or business opportunities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Changes to Terms
              </h2>
              <p className="text-gray-600">
                We may modify these terms at any time. Continued use of the service
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Contact
              </h2>
              <p className="text-gray-600">
                For questions about these Terms, contact us at legal@ai-chatbot-builder.com.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
