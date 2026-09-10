import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PostCard } from '@/components/v2/PostCard';
import { getLatestPosts } from '@/lib/cms-v2';
import { siteV2 } from '@/lib/site-v2';

export const metadata: Metadata = {
  title: siteV2.seo.title,
  description: siteV2.seo.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: siteV2.seo.title,
    description: siteV2.seo.description,
    url: '/',
    siteName: siteV2.name,
    locale: 'pl_PL',
    type: 'website',
    images: [{ url: siteV2.seo.ogImage }]
  }
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://aksen-photo.pl/#business',
  name: 'Aksen Photo',
  url: 'https://aksen-photo.pl/',
  image: siteV2.seo.ogImage,
  logo: siteV2.logo.src,
  telephone: siteV2.contact.phoneDisplay,
  email: siteV2.contact.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Szczecin', addressCountry: 'PL' },
  areaServed: ['Szczecin', 'Zachodniopomorskie', 'Polska'],
  sameAs: siteV2.social.map(item => item.href)
};

export default async function HomePage() {
  const posts = await getLatestPosts(9);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <section className="home-hero-v2">
        <Image className="home-hero-image-v2" src={siteV2.hero.image} alt="Fotograf Szczecin Aksen Photo" fill priority sizes="100vw" />
        <div className="home-hero-overlay-v2" />
        <div className="home-hero-glow-v2" />
        <div className="page-shell-v2 home-hero-content-v2">
          <div className="home-hero-copy-v2">
            <p className="kicker-v2 kicker-light-v2">{siteV2.hero.eyebrow}</p>
            <h1>{siteV2.hero.title}</h1>
            <p className="hero-lead-v2">{siteV2.hero.text}</p>
            <div className="hero-actions-v2">
              <Link className="button" href="/portfolio-slubne-aksen-photo-fotograf-slubny/" prefetch={false}>Zobacz portfolio</Link>
              <Link className="button button-glass" href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false}>Zapytaj o termin</Link>
            </div>
          </div>
          <div className="hero-proof-v2" aria-label="Najważniejsze informacje">
            <div><strong>10+ lat</strong><span>doświadczenia</span></div>
            <div><strong>Naturalnie</strong><span>bez sztucznego pozowania</span></div>
            <div><strong>Szczecin</strong><span>i całe Zachodniopomorskie</span></div>
          </div>
        </div>
      </section>

      <section className="section-v2 intro-v2">
        <div className="page-shell-v2 split-v2">
          <div>
            <p className="kicker-v2">Witam!</p>
            <h2>Fotografia ma przypominać, jak się czuliście. Nie tylko jak wyglądaliście.</h2>
          </div>
          <div className="prose-lead-v2">
            <p>Lubię ludzi i ich emocje. Ich wzruszenia, śmiech, to jak patrzą na siebie i jak się przytulają. To właśnie one tworzą historie, które warto zatrzymać.</p>
            <p>Jestem fotografem ze Szczecina, ale pracuję też w innych miejscach. W dniu ślubu jestem obok, ale nie w centrum. Nie ustawiam Was i nie przerywam. Obserwuję i czekam na te prawdziwe momenty, kiedy jesteście sobą.</p>
            <Link className="text-link-v2" href="/o-mnie-fotograf-szczecin/" prefetch={false}>Więcej o mnie <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="section-v2 dark-section-v2">
        <div className="page-shell-v2 video-grid-v2">
          <a className="video-card-v2" href={siteV2.video.href} target="_blank" rel="noopener noreferrer" aria-label="Otwórz przykładowy teledysk Aksen Photo">
            <Image src={siteV2.video.image} alt="Teledysk Aksen Photo" fill sizes="(max-width: 900px) 100vw, 58vw" />
            <span className="video-overlay-v2" />
            <span className="play-v2" aria-hidden="true">▶</span>
          </a>
          <div className="video-copy-v2">
            <p className="kicker-v2 kicker-light-v2">Film jako bonus</p>
            <h2>{siteV2.video.title}</h2>
            <p>{siteV2.video.text}</p>
            <a className="button button-light" href={siteV2.video.playlist} target="_blank" rel="noopener noreferrer">Zobacz teledyski</a>
          </div>
        </div>
      </section>

      <section id="wybierz-fotografie" className="section-v2 services-v2">
        <div className="page-shell-v2">
          <div className="section-heading-v2">
            <p className="kicker-v2">Oferta</p>
            <h2>Wybierz rodzaj fotografii</h2>
            <p>Pełne galerie i szczegóły usług znajdziesz na dedykowanych podstronach. Zachowuję ich obecne adresy i treści z Aksen-Photo.pl.</p>
          </div>
          <div className="service-grid-v2">
            {siteV2.services.map((service, index) => (
              <Link className={index === 0 ? 'service-card-v2 service-card-v2-wide' : 'service-card-v2'} key={service.href} href={service.href} prefetch={false}>
                <Image src={service.image} alt={service.label} fill sizes={index === 0 ? '(max-width: 760px) 100vw, 66vw' : '(max-width: 760px) 100vw, 33vw'} />
                <span className="service-card-overlay-v2" />
                <span className="service-card-copy-v2"><strong>{service.label}</strong><small>{service.description}</small><em>Zobacz więcej →</em></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-v2 stories-v2">
        <div className="page-shell-v2">
          <div className="section-heading-v2 section-heading-row-v2">
            <div>
              <p className="kicker-v2">Ostatnie wpisy i reportaże</p>
              <h2>Prawdziwe historie z aktualnego Aksen-Photo.pl</h2>
            </div>
            <Link className="text-link-v2" href="/blog-fotograficzny/" prefetch={false}>Cały blog <span>→</span></Link>
          </div>
          {posts.length ? <div className="post-grid-v2">{posts.map((post, index) => <PostCard key={post.id} item={post} featured={index === 0} />)}</div> : <p className="empty-state-v2">Treści blogowe są chwilowo niedostępne z WordPressa.</p>}
        </div>
      </section>

      <section className="section-v2 reviews-v2">
        <div className="page-shell-v2">
          <div className="section-heading-v2"><p className="kicker-v2">Opinie</p><h2>To zaszczyt być częścią Waszych chwil</h2></div>
          <div className="review-grid-v2">
            {siteV2.reviews.map(review => <article className="review-card-v2" key={review.name}><div className="stars-v2">★★★★★</div><blockquote>„{review.text}”</blockquote><strong>{review.name}</strong></article>)}
          </div>
        </div>
      </section>

      <section className="section-v2 seo-copy-v2">
        <div className="page-shell-v2 split-v2">
          <div><p className="kicker-v2">Fotograf Szczecin</p><h2>Naturalna fotografia ślubna i rodzinna – Szczecin i okolice</h2></div>
          <div className="prose-lead-v2">
            <p>Od ponad 10 lat tworzę reportaże ślubne, sesje narzeczeńskie, rodzinne i wizerunkowe w całym Zachodniopomorskim. Nie szukam idealnych póz. Szukam Was w spojrzeniu, w dotyku dłoni, w oddechu między słowami.</p>
            <p>Na co dzień działam w Szczecinie, ale fotografuję też w Stargardzie, Goleniowie, Świnoujściu, Kołobrzegu, Koszalinie, Gryfinie, Policach i Gorzowie Wielkopolskim. Niezależnie od miejsca fotografuję z uważnością i spokojem.</p>
          </div>
        </div>
      </section>

      <section className="section-v2 contact-cta-v2">
        <div className="page-shell-v2 contact-cta-card-v2">
          <div><p className="kicker-v2 kicker-light-v2">Kontakt</p><h2>Napisz do mnie</h2><p>Z ogromną radością odpowiem na Wasze pytania. Opowiedzcie o swoim pomyśle i terminie.</p></div>
          <div className="contact-cta-actions-v2"><Link className="button button-light" href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false}>Przejdź do kontaktu</Link><a href={siteV2.contact.phoneHref}>{siteV2.contact.phoneDisplay}</a><a href={siteV2.contact.emailHref}>{siteV2.contact.email}</a></div>
        </div>
      </section>
    </main>
  );
}
