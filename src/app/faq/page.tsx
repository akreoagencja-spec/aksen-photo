import { Faq } from '@/components/Faq';
import { getFaq } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('FAQ | Fotograf ślubny Szczecin', 'Najczęstsze pytania o rezerwację fotografa ślubnego, reportaż, dojazd, galerie i sposób pracy.', '/faq');

export default async function FaqPage() {
  const items = await getFaq();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">FAQ</p><h1>Wszystko, co warto wiedzieć przed rezerwacją.</h1><p>Tylko pytania dotyczące ślubów, wesel, sesji par i współpracy.</p></div></section><section className="section"><div className="shell"><Faq items={items}/></div></section></main>;
}
