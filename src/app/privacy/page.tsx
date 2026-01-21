import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Account information (email, name) when you sign in with Google</li>
                <li>Support policy configurations you create</li>
                <li>Simulation data and audit logs</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Data Storage
              </h2>
              <p className="text-gray-600 mb-4">
                For anonymous users, all data is stored locally in your browser using
                localStorage. When you sign in, your data can be synced to our secure
                cloud infrastructure powered by Supabase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Data Sharing
              </h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or rent your personal information to third parties.
                We may share information with service providers who assist in our operations:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Supabase (authentication and database)</li>
                <li>Stripe (payment processing)</li>
                <li>OpenAI (AI processing, when enabled)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Your Rights
              </h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Security
              </h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal
                information. However, no method of transmission over the Internet is
                100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Contact Us
              </h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us at
                privacy@ai-chatbot-builder.com.
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
