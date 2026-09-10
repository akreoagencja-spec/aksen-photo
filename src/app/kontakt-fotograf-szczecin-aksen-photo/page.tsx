import { cache } from 'react';
import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { getLegacyContent, getSiteData } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

const path = '/kontakt-fotograf-szczecin-aksen-photo/';
const loadLegacyContent = cache(() => getLegacyContent(path));

export async function generateMetadata() {
  const item = await loadLegacyContent();

  if (!item) {
    return makeMetadata(
      'Kontakt | Fotograf Szczecin Aksen Photo',
      'Skontaktuj się z Aksen Photo i sprawdź dostępność terminu.',
      path
    );
  }

  return makeMetadata(
    item.seoTitle || item.title,
    item.seoDescription || item.excerpt || item.title,
    path,
    item.ogImage || item.image,
    {
      canonical: item.canonical,
      openGraphType: item.ogType,
      openGraphTitle: item.ogTitle,
      openGraphDescription: item.ogDescription,
      openGraphImage: item.ogImage || item.image,
      twitterTitle: item.twitterTitle,
      twitterDescription: item.twitterDescription,
      twitterImage: item.twitterImage,
      robots: {
        index: !item.noIndex,
        follow: !item.noFollow
      }
    }
  );
}

export default async function ContactPage() {
  const { brand } = await getSiteData();
  const phoneHref = `tel:${brand.phone.replace(/[^\d+]/g, '')}`;

  return (
    <main>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Kontakt</p>
          <h1>Napisz do mnie</h1>
          <p>Podaj datę, miejsce i kilka zdań o planach. Sprawdzę termin i wrócę z konkretną odpowiedzią.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell contact-layout">
          <div>
            <p className="body-large">
              <a href={phoneHref}>{brand.phone}</a>
              <br />
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </p>
            <p>Szczecin · Zachodniopomorskie · Polska · Niemcy</p>
            <p>
              <Link className="text-link" href="/faq">Najczęstsze pytania →</Link>
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
