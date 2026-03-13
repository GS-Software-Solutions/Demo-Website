import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  createAuthToken,
  getAuthConfigurationError,
  isValidAccessCode,
} from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  const configError = getAuthConfigurationError();
  if (configError) {
    return NextResponse.json({ error: 'Server authentication is not configured.' }, { status: 500 });
  }

  let code = '';
  try {
    const body = await req.json();
    code = typeof body?.code === 'string' ? body.code.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Access code is required.' }, { status: 400 });
  }

  if (!isValidAccessCode(code)) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 401 });
  }

  const token = createAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Failed to create auth session.' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
