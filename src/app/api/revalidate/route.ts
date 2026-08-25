import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const path = typeof body?.path === 'string' ? body.path : '/';
  revalidatePath(path);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, path });
}
