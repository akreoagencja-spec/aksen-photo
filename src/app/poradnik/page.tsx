import Link from 'next/link';
import { getArticles } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Poradnik ślubny Szczecin', 'Porady Aksen Photo o fotografii ślubnej: cena, harmonogram, sesja, sale i organizacja dnia.', '/poradnik');

export default async function GuidePage() {
  const items = await getArticles();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Poradnik</p><h1>Praktycznie o ślubach i fotografii.</h1><p>Bez przypadkowych tematów. Tylko treści, które pomagają zaplanować dzień i świadomie wybrać fotografa.</p></div></section><section className="section"><div className="shell"><div className="service-grid">{items.map(item=><Link className="service-card" href={`/poradnik/${item.slug}`} key={item.id}><h3>{item.title}</h3><p>{item.excerpt}</p><span>Czytaj →</span></Link>)}</div>{!items.length&&<div className="empty-state">Ślubne artykuły zostaną automatycznie wybrane z WordPressa.</div>}</div></section></main>;
}
