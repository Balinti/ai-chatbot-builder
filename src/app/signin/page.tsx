'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { APP_SLUG } from '@/lib/firebase/config';

const AUTH_HUB_URL = 'https://therobots.io';

function SignInRedirect() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    sessionStorage.setItem('auth_redirect', redirect);

    const returnUrl = `${window.location.origin}/auth/callback`;
    const loginUrl = `${AUTH_HUB_URL}/auth/login.html?app=${APP_SLUG}&return_url=${encodeURIComponent(returnUrl)}`;
    window.location.href = loginUrl;
  }, [redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInRedirect />
    </Suspense>
  );
}
