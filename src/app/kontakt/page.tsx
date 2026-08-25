import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { getSiteData } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Kontakt | Fotograf ślubny Szczecin', 'Skontaktuj się z Aksen Photo i sprawdź dostępność terminu ślubu.', '/kontakt');

export default async function ContactPage() {
  const { brand } = await getSiteData();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Kontakt</p><h1>Opowiedzcie mi o swoim dniu.</h1><p>Podajcie datę, miejsce i kilka zdań o planach. To wystarczy, żebym sprawdził termin i wrócił z konkretną odpowiedzią.</p></div></section><section className="section"><div className="shell contact-layout"><div><p className="body-large"><a href={`tel:${brand.phone.replace(/\s/g,'')}`}>{brand.phone}</a><br/><a href={`mailto:${brand.email}`}>{brand.email}</a></p><p>Szczecin · Zachodniopomorskie · Polska · Niemcy</p><p><Link className="text-link" href="/faq">Najczęstsze pytania →</Link></p></div><ContactForm/></div></section></main>;
}
