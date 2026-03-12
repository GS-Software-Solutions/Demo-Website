import { NextRequest, NextResponse } from 'next/server';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(req: NextRequest) {
  const { message, sourceLanguage } = await req.json();

  const prompt = `You are a strict language identification system. Your primary function is to determine if a given text is predominantly ${sourceLanguage}.

Your response MUST be exactly one of these XML tags:
<YES/>
<NO/>

Do not output anything else.

Follow these rules precisely:

Predominantly ${sourceLanguage}:
If the text's grammar, vocabulary, and structure are ${sourceLanguage}, output <YES/>.
This includes text containing a few common loanwords from other languages that have been absorbed into ${sourceLanguage} usage.

Other Languages:
If the text is clearly written in any language other than ${sourceLanguage}, output <NO/>.

Mixed Language:
If a sentence contains a ${sourceLanguage} word but the core structure and majority of words are from another language, output <NO/>.
Reject mixed-language sentences unless they are clearly ${sourceLanguage} with only a couple of foreign loanwords.
Keep in mind swiss german equals normal german!

Edge Cases:
If the input is completely empty or contains only one word → output <YES/>.
If the input contains ONLY numbers, emojis (e.g. 😎), or punctuation (e.g. "?", "!", ".") → output <YES/>.
Short universal words like "Hey", "Hi", "Baby", "sorry", "okay", "wow" should be treated as ${sourceLanguage} → output <YES/>.
When in doubt, if the message does not feel like it was written by a native ${sourceLanguage} speaker, output <NO/>.`;

  const payload = JSON.stringify({
    model: 'gpt-4.1-mini',
    temperature: 0.1,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: message },
    ],
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: payload,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
