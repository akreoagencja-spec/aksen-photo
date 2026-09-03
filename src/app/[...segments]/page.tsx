import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLegacyArchive, getLegacyContent } from '@/lib/wp';
import { INDEXING_ENABLED, metadata as makeMetadata } from '@/lib/seo';

function routePath(segments: string[]): string {
  return `/${segments.map(segment => encodeURIComponent(segment)).join('/')}/`;
}

export async function generateMetadata({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const path = routePath(segments);
  const [item, archive] = await Promise.all([
    getLegacyContent(path),
    getLegacyArchive(path)
  ]);

  if (item) {
    const meta = makeMetadata(
      item.seoTitle || item.title,
      item.seoDescription || item.excerpt || item.title,
      path,
      item.image
    );

    if (INDEXING_ENABLED && (item.noIndex || item.noFollow)) {
      return {
        ...meta,
        robots: {
          index: !item.noIndex,
          follow: !item.noFollow
        }
      };
    }

    return meta;
  }

  if (archive) {
    const suffix = archive.page > 1 ? ` — strona ${archive.page}` : '';
    const label = archive.kind === 'category' ? 'Kategoria' : 'Tag';
    return makeMetadata(
      `${label}: ${archive.title}${suffix}`,
      archive.description || `Archiwum ${label.toLowerCase()}: ${archive.title}. Aksen Photo.`,
      path
    );
  }

  return makeMetadata('Nie znaleziono strony', 'Ta strona nie istnieje.', path);
}

export default async function LegacyRoutePage({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const path = routePath(segments);
  const [item, archive] = await Promise.all([
    getLegacyContent(path),
    getLegacyArchive(path)
  ]);

  if (item) {
    return (
      <main>
        <section className="page-hero">
          <div className="shell">
            <p className="eyebrow">Aksen Photo</p>
            <h1>{item.title}</h1>
            {item.excerpt && <p>{item.excerpt}</p>}
          </div>
        </section>
        <section className="section">
          <div className="shell rich-content" dangerouslySetInnerHTML={{ __html: item.content }} />
        </section>
      </main>
    );
  }

  if (archive) {
    const previousPath = archive.page <= 2
      ? `/${archive.kind}/${archive.slug}/`
      : `/${archive.kind}/${archive.slug}/page/${archive.page - 1}/`;
    const nextPath = `/${archive.kind}/${archive.slug}/page/${archive.page + 1}/`;

    return (
      <main>
        <section className="page-hero">
          <div className="shell">
            <p className="eyebrow">{archive.kind === 'category' ? 'Kategoria' : 'Tag'}</p>
            <h1>{archive.title}</h1>
            {archive.description && <p>{archive.description}</p>}
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <div className="service-grid">
              {archive.posts.map(post => (
                <Link className="service-card" href={`${post.path}/`.replace(/\/{2,}/g, '/')} key={post.id}>
                  <h2>{post.title}</h2>
                  {post.excerpt && <p>{post.excerpt}</p>}
                  <span>Czytaj →</span>
                </Link>
              ))}
            </div>
            <nav aria-label="Paginacja archiwum" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              {archive.page > 1 && <Link href={previousPath}>← Poprzednia strona</Link>}
              {archive.posts.length === 12 && <Link href={nextPath}>Następna strona →</Link>}
            </nav>
          </div>
        </section>
      </main>
    );
  }

  notFound();
}
