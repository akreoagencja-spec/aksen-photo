import Link from 'next/link';
import { originalSite } from '@/lib/original-site';

export function MobileDock() {
  return (
    <nav className="mobile-dock" aria-label="Szybkie akcje">
      <a className="mobile-dock-call" href={originalSite.contact.phoneHref} aria-label={`Zadzwoń ${originalSite.contact.phoneDisplay}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7.2 2.8c.5-.2 1.1 0 1.4.5l2 3.7c.3.5.2 1.1-.2 1.5L8.8 10c1 2.1 2.9 4 5 5l1.5-1.6c.4-.4 1-.5 1.5-.2l3.8 2c.5.3.7.9.5 1.4l-1.2 3.5c-.2.6-.8 1-1.4 1C9.8 20.9 3.1 14.2 2.9 5.5c0-.6.4-1.2 1-1.4l3.3-1.3Z" />
        </svg>
        <span>Zadzwoń</span>
      </a>
      <Link className="mobile-dock-book" href="/rezerwacja">
        <span>Sprawdź termin</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Link>
    </nav>
  );
}
