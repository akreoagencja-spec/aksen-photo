import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactFormV2 } from '@/components/v2/ContactFormV2';
import { siteV2 } from '@/lib/site-v2';

export const metadata: Metadata = {
  title: 'Kontakt fotograf Szczecin – Aksen Photo',
  description: 'Skontaktuj się z Aksen Photo. Fotografia ślubna, rodzinna, biznesowa i reportażowa w Szczecinie i całym Zachodniopomorskim.',
  alternates: { canonical: `${siteV2.url}/kontakt-fotograf-szczecin-aksen-photo/` }
};

export default function ContactPage() {
  return (
    <main className="inner-page-v2">
      <section className="inner-hero-v2 inner-hero-simple-v2 contact-hero-v2">
        <div className="page-shell-v2">
          <p className="kicker-v2">Kontakt</p>
          <h1>Napisz do mnie</h1>
          <p>Z ogromną radością odpowiem na Wasze pytania. Nie krępujcie się opowiadać o swoich pomysłach. Im więcej szczegółów podacie, tym precyzyjniej będę mógł odpowiedzieć.</p>
        </div>
      </section>

      <section className="section-v2">
        <div className="page-shell-v2 contact-layout-v2">
          <aside className="contact-info-v2">
            <div className="glass-panel-v2">
              <p className="kicker-v2">Aksen Photo</p>
              <h2>Porozmawiajmy o zdjęciach</h2>
              <p>Mieszkam w Szczecinie, ale pracuję na terenie całej Polski.</p>
              <div className="contact-list-v2">
                <span>📍 {siteV2.contact.location}</span>
                <a href={siteV2.contact.phoneHref}>📞 {siteV2.contact.phoneDisplay}</a>
                <a href={siteV2.contact.emailHref}>✉️ {siteV2.contact.email}</a>
              </div>
              <div className="contact-social-v2">{siteV2.social.map(item => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>)}</div>
            </div>
            <div className="contact-note-v2">
              <strong>Co warto napisać?</strong>
              <p>Termin, miejsce, rodzaj uroczystości lub sesji i orientacyjny zakres. Dzięki temu od razu odpowiem konkretnie.</p>
              <Link className="text-link-v2" href="/#wybierz-fotografie">Zobacz ofertę <span>→</span></Link>
            </div>
          </aside>
          <ContactFormV2 />
        </div>
      </section>
    </main>
  );
}
