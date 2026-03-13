import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAuthorizedCookieStore } from '@/lib/server/auth';

const API_TARGET = 'https://api.sexytalk.io/inference';
const API_KEY = process.env.SEXYTALK_API_KEY || '';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isAuthorizedCookieStore(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Server proxy is not configured.' }, { status: 500 });
  }

  const body = await req.text();

  const res = await fetch(API_TARGET, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8',
    },
  });
}
