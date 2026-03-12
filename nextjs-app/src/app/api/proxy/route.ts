import { NextRequest, NextResponse } from 'next/server';

const API_TARGET = 'https://api.sexytalk.io/inference';
const API_KEY = 'ct-9c0cceda-4e0c-45bf-8e3c-ccd1e9bb2178';

export async function POST(req: NextRequest) {
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
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
