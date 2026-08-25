import { ContactForm } from '@/components/ContactForm';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Rezerwacja terminu | Aksen Photo', 'Sprawdź dostępność terminu na reportaż ślubny Aksen Photo.', '/rezerwacja');

export default function BookingPage() {
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Rezerwacja</p><h1>Sprawdźmy Wasz termin.</h1><p>Podajcie datę ślubu, miejsce ceremonii i wesela oraz kilka zdań o planie. Odpowiem z dostępnością i konkretną propozycją.</p></div></section><section className="section"><div className="shell contact-layout"><div><p className="quote-big">Najpierw termin. Później spokojnie ustalimy resztę.</p><p>Nie musicie znać jeszcze dokładnego harmonogramu. Wystarczy data, miejsce i ogólny charakter uroczystości.</p></div><ContactForm/></div></section></main>;
}
