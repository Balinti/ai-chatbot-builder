import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const firebaseToken = requestUrl.searchParams.get('firebase_token');
  const uid = requestUrl.searchParams.get('uid');

  if (firebaseToken && uid) {
    const params = new URLSearchParams({
      firebase_token: firebaseToken,
      uid: uid,
    });
    return NextResponse.redirect(`${origin}/auth/set-session?${params.toString()}`);
  }

  return NextResponse.redirect(`${origin}/?auth_error=no_token`);
}
