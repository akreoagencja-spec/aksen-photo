import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.name || !body?.email || !body?.message || body?.privacy !== '1') return NextResponse.json({ ok: false }, { status: 400 });
  const wordpress = (process.env.WORDPRESS_URL || '').replace(/\/$/, '');
  const secret = process.env.WORDPRESS_BRIDGE_SECRET || '';
  if (!wordpress || !secret) return NextResponse.json({ ok: false, error: 'configuration' }, { status: 500 });
  const response = await fetch(`${wordpress}/wp-json/aksen-headless/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Aksen-Secret': secret },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 502 });
}
