import { getReviews } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Opinie par | Aksen Photo', 'Opinie klientów o reportażach ślubnych Aksen Photo w Szczecinie i regionie.', '/opinie');

export default async function ReviewsPage() {
  const items = await getReviews();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Opinie par</p><h1>Najważniejsze jest to, co czujecie po odebraniu zdjęć.</h1></div></section><section className="section"><div className="shell">{items.length ? <div className="reviews-grid">{items.map(item=><article className="review" key={item.id}><blockquote>„{item.text}”</blockquote><strong>{item.name}</strong>{item.source&&<p>{item.source}</p>}</article>)}</div> : <div className="empty-state">Opinie zostaną pobrane z WordPressa po dodaniu ich w panelu Aksen Headless.</div>}</div></section></main>;
}
