'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { trackLogin } from '@/lib/firebase/client';

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const firebaseToken = searchParams.get('firebase_token');
    const uid = searchParams.get('uid');
    const redirectTo = sessionStorage.getItem('auth_redirect') || '/';
    sessionStorage.removeItem('auth_redirect');

    if (firebaseToken && uid) {
      try {
        const payload = JSON.parse(atob(firebaseToken.split('.')[1]));

        const userInfo = {
          id: uid,
          email: payload.email || '',
          name: payload.name || payload.email || '',
          avatar_url: payload.picture || '',
          firebase_token: firebaseToken,
          expires_at: payload.exp
        };

        localStorage.setItem('user_info', JSON.stringify(userInfo));

        if (userInfo.id && userInfo.email) {
          trackLogin(userInfo.id, userInfo.email).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to process token:', e);
      }
    }

    window.location.href = redirectTo;
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function SetSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
