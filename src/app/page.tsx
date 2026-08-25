import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { ReportageCard } from '@/components/ReportageCard';
import { Faq } from '@/components/Faq';
import { OtherServices } from '@/components/OtherServices';
import { getSiteData } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Fotograf ślubny Szczecin | Aksen Photo', 'Naturalne reportaże ślubne i weselne w Szczecinie. Pełne historie, bez sztucznego pozowania. Polska i Niemcy.');

export default async function HomePage() {
  const data = await getSiteData();
  const featured = data.reportages.slice(0, 5);
  return <main>
    <Hero headline={data.brand.headline} subheadline={data.brand.subheadline} reportage={featured[0]} />
    <section className="trust-strip"><div className="shell trust-grid"><div><strong>10+ lat</strong><span>doświadczenia</span></div><div><strong>Naturalnie</strong><span>bez sztucznego pozowania</span></div><div><strong>PL + DE</strong><span>dojazd na śluby</span></div><div><strong>Online</strong><span>galeria gotowa do dzielenia</span></div></div></section>
    <section className="section"><div className="shell split"><div><p className="eyebrow">Wasza historia</p><p className="quote-big">Nie fotografuję „ślubów”. Fotografuję ludzi, relacje i to, co dzieje się pomiędzy.</p></div><div><p className="body-large">{data.brand.intro}</p><p>Najważniejsze są chwile, których nie da się powtórzyć: spojrzenie przed ceremonią, dłonie rodziców, śmiech przy stole i energia parkietu. Dlatego pokazuję całe historie, a nie zestaw przypadkowych kadrów.</p><Link className="text-link" href="/reportaze">Zobacz pełne reportaże →</Link></div></div></section>
    <section className="section muted-section"><div className="shell"><div className="section-head"><p className="eyebrow">Portfolio ślubne</p><h2>Pełne reportaże. Od pierwszego kadru do ostatniego tańca.</h2><p>To tutaj widać, jak naprawdę pracuję: przygotowania, ceremonia, bliscy, detale, emocje i wesele.</p></div>{featured.length ? <div className="story-grid">{featured.map((item,index)=><ReportageCard key={item.id} item={item} featured={index===0}/>)}</div> : <div className="empty-state">Reportaże pojawią się automatycznie po oznaczeniu ślubnych realizacji w WordPressie.</div>}</div></section>
    <section className="section"><div className="shell"><div className="section-head"><p className="eyebrow">Jak pracuję</p><h2>Jestem blisko, ale nie przeszkadzam.</h2></div><div className="process-grid"><div className="process-card"><span className="number">01</span><h3>Obserwuję</h3><p>Nie zatrzymuję wydarzeń dla zdjęcia. Szukam emocji i gestów, które dzieją się naprawdę.</p></div><div className="process-card"><span className="number">02</span><h3>Prowadzę, gdy trzeba</h3><p>Podczas portretów i krótkiego pleneru pomagam tak, żebyście nadal wyglądali jak Wy.</p></div><div className="process-card"><span className="number">03</span><h3>Oddaję historię</h3><p>Selekcja i obróbka budują spójną opowieść, a nie zbiór przypadkowych zdjęć.</p></div></div></div></section>
    <section className="section muted-section"><div className="shell split"><div><p className="eyebrow">O mnie</p><h2 className="quote-big">Fotografia ma cofać czas, nie pokazywać modny filtr.</h2></div><div><p className="body-large">{data.brand.about}</p><Link className="text-link" href="/o-mnie">Poznaj mnie lepiej →</Link></div></div></section>
    <section className="section"><div className="shell"><div className="offer-panel"><p className="eyebrow light">Oferta ślubna</p><h2>{data.offer.title}</h2><p>{data.offer.intro}</p><ul className="offer-list">{data.offer.bullets.map(item=><li key={item}>{item}</li>)}</ul><p><strong>{data.offer.videoBonus}</strong></p><div className="actions"><Link className="button button-light" href="/oferta">Zobacz pełną ofertę</Link><Link className="text-link light" href="/rezerwacja">Sprawdź termin →</Link></div></div></div></section>
    {data.reviews.length > 0 && <section className="section"><div className="shell"><div className="section-head"><p className="eyebrow">Opinie par</p><h2>Najlepszą rekomendacją jest to, co zostaje po współpracy.</h2></div><div className="reviews-grid">{data.reviews.slice(0,3).map(item=><article className="review" key={item.id}><blockquote>„{item.text}”</blockquote><strong>{item.name}</strong></article>)}</div><div className="actions"><Link className="text-link" href="/opinie">Zobacz więcej opinii →</Link></div></div></section>}
    <section className="section muted-section"><div className="shell"><div className="section-head"><p className="eyebrow">FAQ</p><h2>Najczęstsze pytania przed rezerwacją</h2></div><Faq items={data.faq.slice(0,8)} /><div className="actions"><Link className="text-link" href="/faq">Wszystkie pytania →</Link></div></div></section>
    <section className="section"><div className="shell"><div className="section-head"><p className="eyebrow">Wasz termin</p><h2>Jeżeli czujecie ten sposób fotografowania, opowiedzcie mi o swoim dniu.</h2><p>Data, miejsce ceremonii i wesela wystarczą na początek.</p></div><Link className="button" href="/rezerwacja">Sprawdź dostępność terminu</Link></div></section>
    <OtherServices items={data.otherServices} />
  </main>;
}
