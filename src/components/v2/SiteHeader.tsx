import Image from 'next/image';
import Link from 'next/link';
import { MobileMenu } from '@/components/v2/MobileMenu';
import { siteV2 } from '@/lib/site-v2';

export function SiteHeader() {
  return (
    <header className="site-header-v2">
      <div className="site-header-shell">
        <Link className="site-brand" href="/" aria-label="Aksen Photo — strona główna">
          <Image src={siteV2.logo.src} alt={siteV2.logo.alt} width={260} height={74} priority sizes="(max-width: 720px) 150px, 210px" />
        </Link>

        <nav className="desktop-nav-v2" aria-label="Główna nawigacja">
          {siteV2.nav.map(item => (
            <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>
          ))}
        </nav>

        <div className="desktop-header-actions">
          <a className="header-phone" href={siteV2.contact.phoneHref}>{siteV2.contact.phoneDisplay}</a>
          <Link className="button button-small" href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false}>Zapytaj o termin</Link>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
