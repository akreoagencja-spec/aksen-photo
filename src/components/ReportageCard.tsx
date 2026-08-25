import Image from 'next/image';
import Link from 'next/link';
import type { Reportage } from '@/types/content';

export function ReportageCard({ item, featured = false }: { item: Reportage; featured?: boolean }) {
  return <article className={featured ? 'story-card story-card-featured' : 'story-card'}>
    <Link href={`/reportaze/${item.slug}`}>
      <div className="story-media">
        {item.hero ? <Image src={item.hero.url} alt={item.hero.alt || item.title} fill sizes={featured ? '(max-width: 760px) 100vw, 66vw' : '(max-width: 760px) 100vw, 33vw'} /> : <div className="media-placeholder" />}
      </div>
      <div className="story-copy"><p className="eyebrow">{[item.location, item.venue].filter(Boolean).join(' · ') || 'Reportaż ślubny'}</p><h3>{item.title}</h3><p>{item.excerpt}</p><span>Zobacz historię →</span></div>
    </Link>
  </article>;
}
