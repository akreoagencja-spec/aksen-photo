import Link from 'next/link';
import { getSiteData } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Oferta fotografii ślubnej Szczecin', 'Pełna oferta reportażu ślubnego Aksen Photo: fotografia ceremonii i wesela, galeria online, sesja i teledysk.', '/oferta');

export default async function OfferPage() {
  const { offer } = await getSiteData();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Oferta ślubna</p><h1>{offer.title}</h1><p>{offer.intro}</p></div></section><section className="section"><div className="shell split"><div><p className="quote-big">Nie sprzedaję liczby kliknięć migawki. Oddaję kompletną historię dnia.</p></div><div><ul className="body-large">{offer.bullets.map(item=><li key={item}>{item}</li>)}</ul><p><strong>{offer.videoBonus}</strong></p></div></div></section><section className="section muted-section"><div className="shell"><div className="section-head"><p className="eyebrow">Zakres</p><h2>Najpierw poznajmy Wasz plan.</h2><p>Inaczej wygląda kameralny ślub cywilny, inaczej pełny dzień z przygotowaniami i weselem. Dlatego zamiast wciskać każdą parę w identyczny schemat, dopasowuję zakres do wydarzenia.</p></div><Link className="button" href="/rezerwacja">Zapytaj o termin i ofertę</Link></div></section></main>;
}
