import Image from 'next/image';
import Link from 'next/link';
import { originalSite } from '@/lib/original-site';

export function Hero() {
  return (
    <section className="hero">
      <Image
        className="hero-image"
        src={originalSite.hero.src}
        alt={originalSite.hero.alt}
        fill
        priority
        sizes="100vw"
      />
      <div className="hero-shade" />
      <div className="shell hero-content">
        <p className="eyebrow light">Fotograf Szczecin · Zachodniopomorskie · Polska</p>
        <h1>{originalSite.hero.headline}</h1>
        <p>{originalSite.hero.text}</p>
        <div className="actions">
          <Link className="button button-light" href="/o-mnie-fotograf-szczecin/">Więcej o mnie</Link>
          <Link className="text-link light" href="/portfolio-slubne-aksen-photo-fotograf-slubny/">Zobacz portfolio ślubne →</Link>
        </div>
      </div>
    </section>
  );
}
