import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { ReportageCard } from '@/components/ReportageCard';
import { Faq } from '@/components/Faq';
import { getSiteData } from '@/lib/wp';
import { getPublicReportages } from '@/lib/wp-public';
import { metadata as makeMetadata } from '@/lib/seo';
import { originalSite } from '@/lib/original-site';

export const metadata = makeMetadata(
  originalSite.homeSeo.title,
  originalSite.homeSeo.description,
  '/',
  originalSite.ogImage
);

export default async function HomePage() {
  const [data, publicReportages] = await Promise.all([getSiteData(), getPublicReportages()]);
  const featured = (data.reportages.length ? data.reportages : publicReportages).slice(0, 5);

  return (
    <main>
      <Hero />

      <section className="trust-strip" aria-label="Aksen Photo w skrócie">
        <div className="shell trust-grid">
          <div><strong>10+ lat</strong><span>doświadczenia</span></div>
          <div><strong>Naturalnie</strong><span>bez sztucznego pozowania</span></div>
          <div><strong>Szczecin</strong><span>i całe Zachodniopomorskie</span></div>
          <div><strong>Online</strong><span>galerie gotowe do dzielenia</span></div>
        </div>
      </section>

      <section className="section original-intro">
        <div className="shell split">
          <div>
            <p className="eyebrow">Aksen Photo</p>
            <h2 className="quote-big">{originalSite.hero.headline}</h2>
          </div>
          <div>
            <p className="body-large">{originalSite.hero.text}</p>
            <p>{data.brand.intro}</p>
            <Link className="text-link" href="/o-mnie-fotograf-szczecin/" prefetch={false}>Więcej o mnie →</Link>
          </div>
        </div>
      </section>

      <section className="section video-bonus-section">
        <div className="shell video-bonus-grid">
          <a className="video-poster" href={originalSite.video.videoHref} target="_blank" rel="noopener noreferrer" aria-label="Otwórz przykładowy teledysk Aksen Photo na YouTube">
            <Image src={originalSite.ogImage} alt="Teledysk do reportażu Aksen Photo" fill sizes="(max-width: 900px) 100vw, 58vw" />
            <span className="video-poster-shade" />
            <span className="video-play" aria-hidden="true">▶</span>
          </a>
          <div className="video-bonus-copy">
            <p className="eyebrow">Film jako bonus</p>
            <h2>{originalSite.video.title}</h2>
            <p>{originalSite.video.text}</p>
            <a className="button" href={originalSite.video.href} target="_blank" rel="noopener noreferrer">Zobacz więcej</a>
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Portfolio ślubne</p>
            <h2>Pełne reportaże. Od pierwszego kadru do ostatniego tańca.</h2>
            <p>To tutaj widać, jak naprawdę pracuję: przygotowania, ceremonia, bliscy, detale, emocje i wesele.</p>
          </div>
          {featured.length ? (
            <div className="story-grid">
              {featured.map((item, index) => <ReportageCard key={item.id} item={item} featured={index === 0} />)}
            </div>
          ) : (
            <div className="empty-state">Reportaże pojawią się automatycznie z obecnego WordPressa.</div>
          )}
          <div className="actions">
            <Link className="button" href="/portfolio-slubne-aksen-photo-fotograf-slubny/" prefetch={false}>Zobacz portfolio ślubne</Link>
          </div>
        </div>
      </section>

      <section className="section original-reviews-section" id="opinie">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Opinie o mnie</p>
            <h2>Sprawdź, co napisali moi klienci o współpracy ze mną.</h2>
          </div>
          <div className="reviews-grid reviews-grid-original">
            {originalSite.reviews.map(item => (
              <article className="review" key={item.name}>
                <div className="review-stars" aria-label="5 gwiazdek">★★★★★</div>
                <blockquote>„{item.text}”</blockquote>
                <strong>{item.name}</strong>
              </article>
            ))}
          </div>
          <div className="actions">
            <Link className="text-link" href="/o-mnie-fotograf-szczecin/#opinie" prefetch={false}>Zobacz więcej opinii →</Link>
          </div>
        </div>
      </section>

      <section className="section services-section muted-section" id="wybierz-fotografie">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Oferta</p>
            <h2>Wybierz rodzaj fotografii</h2>
            <p>Kliknij w interesującą Ciebie kategorię i zobacz pełne galerie oraz przykładowe reportaże z ostatnich realizacji.</p>
          </div>
          <div className="photo-service-grid">
            {originalSite.services.map(item => (
              <Link className="photo-service-card" href={item.href} prefetch={false} key={item.href}>
                <Image src={item.image} alt={item.label} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" />
                <span className="photo-service-shade" />
                <span className="photo-service-title">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head"><p className="eyebrow">Jak pracuję</p><h2>Jestem blisko, ale nie przeszkadzam.</h2></div>
          <div className="process-grid">
            <div className="process-card"><span className="number">01</span><h3>Obserwuję</h3><p>Nie zatrzymuję wydarzeń dla zdjęcia. Szukam emocji i gestów, które dzieją się naprawdę.</p></div>
            <div className="process-card"><span className="number">02</span><h3>Prowadzę, gdy trzeba</h3><p>Podczas portretów i krótkiego pleneru pomagam tak, żebyście nadal wyglądali jak Wy.</p></div>
            <div className="process-card"><span className="number">03</span><h3>Oddaję historię</h3><p>Selekcja i obróbka budują spójną opowieść, a nie zbiór przypadkowych zdjęć.</p></div>
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="shell split">
          <div><p className="eyebrow">O mnie</p><h2 className="quote-big">Fotografia ma cofać czas, nie pokazywać modny filtr.</h2></div>
          <div><p className="body-large">{data.brand.about}</p><Link className="text-link" href="/o-mnie-fotograf-szczecin/" prefetch={false}>Poznaj mnie lepiej →</Link></div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="offer-panel">
            <p className="eyebrow light">Fotografia ślubna</p>
            <h2>{data.offer.title}</h2>
            <p>{data.offer.intro}</p>
            <ul className="offer-list">{data.offer.bullets.map(item => <li key={item}>{item}</li>)}</ul>
            <p><strong>{data.offer.videoBonus}</strong></p>
            <div className="actions">
              <Link className="button button-light" href="/portfolio-slubne-aksen-photo-fotograf-slubny/" prefetch={false}>Fotografia ślubna</Link>
              <Link className="text-link light" href="/rezerwacja">Sprawdź termin →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="shell">
          <div className="section-head"><p className="eyebrow">FAQ</p><h2>Najczęstsze pytania przed rezerwacją</h2></div>
          <Faq items={data.faq.slice(0, 8)} />
          <div className="actions"><Link className="text-link" href="/faq">Wszystkie pytania →</Link></div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="shell final-cta-grid">
          <div>
            <p className="eyebrow">Kontakt</p>
            <h2>Porozmawiajmy o zdjęciach.</h2>
            <p>{originalSite.contact.location} · {originalSite.contact.phoneDisplay} · {originalSite.contact.email}</p>
          </div>
          <div className="actions">
            <Link className="button" href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false}>Napisz do mnie</Link>
            <a className="text-link" href={originalSite.contact.phoneHref}>Zadzwoń →</a>
          </div>
        </div>
      </section>
    </main>
  );
}
