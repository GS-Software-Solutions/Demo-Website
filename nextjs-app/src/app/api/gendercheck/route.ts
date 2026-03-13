import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAuthorizedCookieStore } from '@/lib/server/auth';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isAuthorizedCookieStore(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!OPENAI_KEY) {
    return NextResponse.json({ error: 'Gender check is not configured.' }, { status: 500 });
  }

  let image = '';
  try {
    const body = await req.json();
    image = typeof body?.image === 'string' ? body.image : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!image) {
    return NextResponse.json({ error: 'image is required.' }, { status: 400 });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You are a gender detection system. Look at the photo and determine if the person appears male or female. Respond with exactly one word: MALE or FEMALE. If you cannot determine, respond with UNKNOWN.',
        },
        {
          role: 'user',
          content: [{ type: 'image_url', image_url: { url: image } }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8',
      },
    });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'UNKNOWN';

  return NextResponse.json({ gender: content });
}
