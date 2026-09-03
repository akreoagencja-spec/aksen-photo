import { NextResponse } from 'next/server';

const MAX_BODY_BYTES = 16_384;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  return (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 128);
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (rateLimits.size > 500) {
    for (const [entryKey, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(entryKey);
    }
  }
  return current.count > RATE_MAX_REQUESTS;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function cleanSingleLine(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/\0/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanText(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/\0/g, '').trim().slice(0, max);
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429, headers: { 'Retry-After': '600' } });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ ok: false }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let raw = '';
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (cleanSingleLine(body.website, 200)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const payload = {
    name: cleanSingleLine(body.name, 120),
    email: cleanSingleLine(body.email, 254).toLowerCase(),
    phone: cleanSingleLine(body.phone, 50),
    date: cleanSingleLine(body.date, 20),
    place: cleanSingleLine(body.place, 200),
    message: cleanText(body.message, 5000),
    privacy: body.privacy === '1' ? '1' : '0'
  };

  if (
    payload.name.length < 2 ||
    !validEmail(payload.email) ||
    payload.message.length < 10 ||
    payload.privacy !== '1'
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const wordpress = (process.env.WORDPRESS_URL || '').replace(/\/$/, '');
  const secret = process.env.WORDPRESS_BRIDGE_SECRET || '';
  if (!wordpress || secret.length < 24) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  try {
    const response = await fetch(`${wordpress}/wp-json/aksen-headless/v1/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aksen-Secret': secret
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(7000)
    });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
