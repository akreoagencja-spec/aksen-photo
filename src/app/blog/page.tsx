import Link from 'next/link';
import { getArticles } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Blog fotograficzny — śluby, sesje i porady',
  'Artykuły Aksen Photo o fotografii ślubnej, sesjach, przygotowaniach i pracy fotografa w Szczecinie i okolicach.',
  '/blog/'
);

export default async function BlogPage() {
  const items = await getArticles();

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Blog</p>
          <h1>Porady, historie i fotografia od środka.</h1>
          <p>Artykuły Aksen Photo zachowane pod dotychczasowymi adresami.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="service-grid">
            {items.map(item => (
              <Link className="service-card" href={`/${item.slug}/`} key={item.id}>
                <h2>{item.title}</h2>
                <p>{item.excerpt}</p>
                <span>Czytaj →</span>
              </Link>
            ))}
          </div>
          {!items.length && <div className="empty-state">Artykuły zostaną pobrane z WordPressa.</div>}
        </div>
      </section>
    </main>
  );
}
