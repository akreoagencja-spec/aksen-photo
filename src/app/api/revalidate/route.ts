import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

const MAX_BODY_BYTES = 2048;

function secretsMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (expectedBuffer.length < 32 || providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function validPath(value: unknown) {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > 512) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (value.includes('\\') || value.includes('\r') || value.includes('\n') || value.includes('?') || value.includes('#')) return null;
  return value;
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET || '';
  const provided = request.headers.get('x-revalidate-secret') || '';
  if (!secretsMatch(provided, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
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

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = validPath(body.path);
  if (!path) return NextResponse.json({ ok: false }, { status: 400 });

  revalidatePath(path);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, path });
}
