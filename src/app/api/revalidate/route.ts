import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

function secretsMatch(provided: string, expected: string) {
  if (expected.length < 32 || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

function validPath(value: unknown) {
  if (typeof value !== 'string') return '/';
  if (value.length > 512) return null;
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

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = validPath((body as Record<string, unknown>).path);
  if (!path) return NextResponse.json({ ok: false }, { status: 400 });

  revalidatePath(path);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, path });
}
