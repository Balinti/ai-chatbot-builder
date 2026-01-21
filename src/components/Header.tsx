'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GoogleAuth from './GoogleAuth';

export default function Header() {
  const pathname = usePathname();

  // Don't show header on landing page (it has its own design)
  if (pathname === '/') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-xl text-gray-900">
              AI Chatbot Builder
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/app"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                App
              </Link>
              <Link
                href="/billing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Pricing
              </Link>
              <Link
                href="/integrations"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Integrations
              </Link>
            </nav>
            <GoogleAuth />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-gray-900">AI Chatbot Builder</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/app"
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/app'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Playground
            </Link>
            <Link
              href="/integrations"
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/integrations'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Integrations
            </Link>
            <Link
              href="/billing"
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/billing'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Billing
            </Link>
          </nav>
        </div>
        <GoogleAuth />
      </div>
    </header>
  );
}
