import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostCard } from '@/components/v2/PostCard';
import { getArchive, getContentByPath, parseArchivePath } from '@/lib/cms-v2';
import { siteV2 } from '@/lib/site-v2';

const indexingEnabled = process.env.ALLOW_INDEXING === 'true';

type RouteProps = { params: Promise<{ segments: string[] }> };

function routePath(segments: string[]) {
  return `/${segments.map(segment => encodeURIComponent(decodeURIComponent(segment))).join('/')}`;
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { segments } = await params;
  const path = routePath(segments);
  const archiveType = parseArchivePath(path);

  if (archiveType) {
    const archive = await getArchive(path);
    if (!archive) return {};
    const title = `${archive.name}${archive.page > 1 ? ` – strona ${archive.page}` : ''}`;
    const canonical = `${siteV2.url}${archive.path}/`.replace(/([^:]\/)\/+/, '$1');
    return {
      title,
      description: archive.description || `Archiwum ${archive.name} w Aksen Photo.`,
      alternates: { canonical },
      robots: indexingEnabled ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
      openGraph: { title, description: archive.description || undefined, url: canonical, type: 'website', siteName: siteV2.name }
    };
  }

  const item = await getContentByPath(path);
  if (!item) return {};
  const canonical = item.canonical || `${siteV2.url}${item.path === '/' ? '' : `${item.path}/`}`;
  const title = item.seoTitle || item.title;
  const description = item.seoDescription || item.excerpt || siteV2.seo.description;
  const image = item.ogImage || item.image;

  return {
    title,
    description,
    alternates: { canonical },
    robots: indexingEnabled
      ? { index: !item.noIndex, follow: !item.noFollow }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      title: item.ogTitle || title,
      description: item.ogDescription || description,
      url: canonical,
      siteName: siteV2.name,
      locale: 'pl_PL',
      type: item.type === 'post' ? 'article' : 'website',
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: item.twitterTitle || item.ogTitle || title,
      description: item.twitterDescription || item.ogDescription || description,
      images: item.twitterImage || image ? [item.twitterImage || image || ''] : undefined
    }
  };
}

export default async function CmsRoutePage({ params }: RouteProps) {
  const { segments } = await params;
  const path = routePath(segments);
  const archiveType = parseArchivePath(path);

  if (archiveType) {
    const archive = await getArchive(path);
    if (!archive) notFound();
    const base = `/${archive.kind}/${archive.slug}`;
    return (
      <main className="inner-page-v2">
        <section className="inner-hero-v2 inner-hero-simple-v2">
          <div className="page-shell-v2">
            <p className="kicker-v2">{archive.kind === 'category' ? 'Kategoria' : 'Tag'}</p>
            <h1>{archive.name}</h1>
            {archive.description ? <p>{archive.description}</p> : null}
          </div>
        </section>
        <section className="section-v2">
          <div className="page-shell-v2">
            {archive.posts.length ? <div className="post-grid-v2">{archive.posts.map(post => <PostCard key={post.id} item={post} />)}</div> : <div className="empty-state-v2">Brak wpisów na tej stronie archiwum.</div>}
            <nav className="pagination-v2" aria-label="Paginacja">
              {archive.page > 1 ? <Link className="button button-secondary" href={archive.page === 2 ? `${base}/` : `${base}/page/${archive.page - 1}/`} prefetch={false}>← Nowsze</Link> : <span />}
              {archive.posts.length === 12 ? <Link className="button button-secondary" href={`${base}/page/${archive.page + 1}/`} prefetch={false}>Starsze →</Link> : null}
            </nav>
          </div>
        </section>
      </main>
    );
  }

  const item = await getContentByPath(path);
  if (!item) notFound();

  return (
    <main className="inner-page-v2">
      <section className={item.image ? 'inner-hero-v2 inner-hero-image-v2' : 'inner-hero-v2 inner-hero-simple-v2'}>
        {item.image ? <Image className="inner-hero-photo-v2" src={item.image} alt={item.imageAlt || item.title} fill priority sizes="100vw" /> : null}
        {item.image ? <div className="inner-hero-overlay-v2" /> : null}
        <div className="page-shell-v2 inner-hero-content-v2">
          <p className={item.image ? 'kicker-v2 kicker-light-v2' : 'kicker-v2'}>{item.type === 'post' ? 'Aksen Photo · historia' : 'Aksen Photo'}</p>
          <h1>{item.title}</h1>
          {item.excerpt ? <p>{item.excerpt}</p> : null}
        </div>
      </section>

      <section className="section-v2 cms-section-v2">
        <div className="page-shell-v2 cms-layout-v2">
          <article className="cms-content-v2" dangerouslySetInnerHTML={{ __html: item.content }} />
          <aside className="cms-aside-v2">
            <div className="glass-panel-v2">
              <p className="kicker-v2">Aksen Photo</p>
              <h2>Chcesz podobny reportaż lub sesję?</h2>
              <p>Napisz, jaki termin i rodzaj fotografii Cię interesuje. Odpowiem konkretnie.</p>
              <Link className="button" href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false}>Zapytaj o termin</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-v2 related-services-v2">
        <div className="page-shell-v2">
          <div className="section-heading-v2"><p className="kicker-v2">Więcej</p><h2>Pozostałe rodzaje fotografii</h2></div>
          <div className="compact-links-v2">{siteV2.offerLinks.slice(0, 8).map(link => <Link key={link.href} href={link.href} prefetch={false}>{link.label}<span>→</span></Link>)}</div>
        </div>
      </section>
    </main>
  );
}
