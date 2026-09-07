import Image from 'next/image';
import Link from 'next/link';
import { originalSite } from '@/lib/original-site';

function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'social-links social-links-compact' : 'social-links'} aria-label="Aksen Photo w social media">
      {originalSite.social.map(item => (
        <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
          <span aria-hidden="true">{item.short}</span>
        </a>
      ))}
      <a href={originalSite.contact.phoneHref} aria-label={`Zadzwoń ${originalSite.contact.phoneDisplay}`}>
        <span aria-hidden="true">TEL</span>
      </a>
    </div>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand-logo" href="/" aria-label="Aksen Photo — strona główna">
          <Image
            src={originalSite.logo.src}
            alt={originalSite.logo.alt}
            width={260}
            height={74}
            priority
            sizes="(max-width: 640px) 170px, 220px"
          />
        </Link>

        <nav className="desktop-nav" aria-label="Główna nawigacja">
          {originalSite.nav.map(item => 'children' in item && item.children ? (
            <div className="nav-dropdown" key={item.label}>
              <Link href={item.href} className="nav-dropdown-trigger">{item.label}<span aria-hidden="true">⌄</span></Link>
              <div className="nav-dropdown-menu">
                {item.children.map(child => <Link key={child.href} href={child.href}>{child.label}</Link>)}
              </div>
            </div>
          ) : <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className="header-actions">
          <SocialLinks compact />
          <Link className="button button-small header-booking" href="/rezerwacja">Sprawdź termin</Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Otwórz menu"><span>Menu</span><span className="menu-bars" aria-hidden="true">☰</span></summary>
          <div className="mobile-menu-panel">
            <nav aria-label="Nawigacja mobilna">
              {originalSite.nav.map(item => 'children' in item && item.children ? (
                <details className="mobile-submenu" key={item.label}>
                  <summary>{item.label}</summary>
                  <div>
                    {item.children.map(child => <Link key={child.href} href={child.href}>{child.label}</Link>)}
                  </div>
                </details>
              ) : <Link key={item.href} href={item.href}>{item.label}</Link>)}
            </nav>
            <Link className="button mobile-booking" href="/rezerwacja">Sprawdź termin</Link>
            <SocialLinks />
          </div>
        </details>
      </div>
    </header>
  );
}
