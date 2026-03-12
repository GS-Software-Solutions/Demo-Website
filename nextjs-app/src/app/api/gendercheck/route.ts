import { NextRequest, NextResponse } from 'next/server';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You are a gender detection system. Look at the photo and determine if the person appears male or female. Respond with exactly one word: MALE or FEMALE. If you cannot determine, respond with UNKNOWN.',
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image } },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'UNKNOWN';

  return NextResponse.json({ gender: content });
}
