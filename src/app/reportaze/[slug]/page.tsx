import { permanentRedirect } from 'next/navigation';

export default async function ReportagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/${encodeURIComponent(slug)}/`);
}
