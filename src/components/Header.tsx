import Link from 'next/link';

const nav = [
  ['Reportaże', '/reportaze'],
  ['Oferta', '/oferta'],
  ['O mnie', '/o-mnie'],
  ['Opinie', '/opinie'],
  ['FAQ', '/faq'],
  ['Poradnik', '/poradnik'],
  ['Kontakt', '/kontakt']
] as const;

export function Header() {
  return <header className="site-header">
    <div className="shell header-inner">
      <Link className="brand" href="/">AKSEN PHOTO</Link>
      <nav className="desktop-nav" aria-label="Główna nawigacja">
        {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <Link className="button button-small" href="/rezerwacja">Sprawdź termin</Link>
    </div>
  </header>;
}
