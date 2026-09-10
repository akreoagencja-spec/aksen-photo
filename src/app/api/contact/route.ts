import { NextResponse } from 'next/server';

const MAX_BODY = 20_000;

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY) return NextResponse.json({ ok: false }, { status: 413 });

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (clean(raw.company, 120)) return NextResponse.json({ ok: true });

  const body = {
    name: clean(raw.name, 100),
    email: clean(raw.email, 160).toLowerCase(),
    phone: clean(raw.phone, 50),
    type: clean(raw.type, 100),
    message: clean(raw.message, 5000),
    privacy: clean(raw.privacy, 2)
  };

  if (!body.name || !body.message || body.privacy !== '1' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const wordpress = (process.env.WORDPRESS_URL || '').replace(/\/+$/, '');
  const secret = process.env.WORDPRESS_BRIDGE_SECRET || '';
  if (!wordpress || !secret) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });

  try {
    const response = await fetch(`${wordpress}/wp-json/aksen-headless/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Aksen-Secret': secret },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
