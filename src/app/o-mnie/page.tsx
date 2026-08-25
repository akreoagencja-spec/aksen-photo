import { getSiteData } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('O mnie | Fotograf ślubny Szczecin', 'Poznaj Aksen Photo i sposób pracy podczas ślubów. Naturalny reportaż, dyskretna obecność i ponad 10 lat doświadczenia.', '/o-mnie');

export default async function AboutPage() {
  const { brand } = await getSiteData();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">O mnie</p><h1>Jestem obok, ale nie w centrum.</h1><p>{brand.about}</p></div></section><section className="section"><div className="shell split"><div><p className="quote-big">Nie szukam idealnych póz. Szukam Was w spojrzeniu, dotyku dłoni i sekundach pomiędzy słowami.</p></div><div><p className="body-large">Zależy mi na fotografiach, które za kilka lat nie będą wyglądały jak produkt chwilowej mody. Kolor, światło i emocje mają być prawdziwe.</p><p>Podczas reportażu działam spokojnie i dyskretnie. Pomagam, gdy tego potrzebujecie, ale nie zamieniam ślubu w sesję zdjęciową.</p></div></div></section></main>;
}
