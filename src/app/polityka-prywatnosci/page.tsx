import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Polityka prywatności', 'Polityka prywatności Aksen Photo.', '/polityka-prywatnosci');

export default function PrivacyPage(){return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Prywatność</p><h1>Polityka prywatności</h1><p>Treść polityki prywatności powinna zostać zsynchronizowana z aktualnym dokumentem Aksen Photo przed uruchomieniem produkcyjnym.</p></div></section></main>}
