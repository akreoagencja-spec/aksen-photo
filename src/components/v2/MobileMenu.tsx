'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { siteV2 } from '@/lib/site-v2';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="mobile-nav-wrap">
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-site-menu"
        aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
        onClick={() => setOpen(value => !value)}
      >
        <span />
        <span />
      </button>

      {open ? (
        <>
          <button className="mobile-nav-backdrop" type="button" aria-label="Zamknij menu" onClick={() => setOpen(false)} />
          <div id="mobile-site-menu" className="mobile-nav-sheet" role="dialog" aria-modal="true" aria-label="Menu Aksen Photo">
            <div className="mobile-nav-head">
              <span>Menu</span>
              <button type="button" className="mobile-nav-close" onClick={() => setOpen(false)} aria-label="Zamknij menu">×</button>
            </div>
            <nav className="mobile-nav-links" aria-label="Nawigacja mobilna">
              {siteV2.nav.map(item => (
                <Link key={item.href} href={item.href} prefetch={false} onClick={() => setOpen(false)}>{item.label}</Link>
              ))}
            </nav>
            <div className="mobile-nav-divider" />
            <p className="mobile-nav-label">Oferta</p>
            <div className="mobile-offer-grid">
              {siteV2.offerLinks.map(item => (
                <Link key={item.href} href={item.href} prefetch={false} onClick={() => setOpen(false)}>{item.label}</Link>
              ))}
            </div>
            <div className="mobile-nav-actions">
              <a className="button button-secondary" href={siteV2.contact.phoneHref}>Zadzwoń</a>
              <Link className="button" href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false} onClick={() => setOpen(false)}>Napisz do mnie</Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
