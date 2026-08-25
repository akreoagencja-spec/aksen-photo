import Image from 'next/image';
import Link from 'next/link';
import type { Reportage } from '@/types/content';

export function Hero({ headline, subheadline, reportage }: { headline: string; subheadline: string; reportage?: Reportage }) {
  const image = reportage?.hero;
  return <section className="hero">
    {image ? <Image className="hero-image" src={image.url} alt={image.alt || 'Naturalny reportaż ślubny Aksen Photo'} fill priority sizes="100vw" /> : <div className="hero-placeholder" />}
    <div className="hero-shade" />
    <div className="shell hero-content">
      <p className="eyebrow light">Fotograf ślubny Szczecin · Polska · Niemcy</p>
      <h1>{headline}</h1>
      <p>{subheadline}</p>
      <div className="actions"><Link className="button button-light" href="/rezerwacja">Sprawdź termin</Link><Link className="text-link light" href="/reportaze">Zobacz pełne reportaże →</Link></div>
    </div>
  </section>;
}
