import Image from 'next/image';
import Link from 'next/link';
import { originalSite } from '@/lib/original-site';
import { SocialIcon } from '@/components/SocialIcon';

const offerNav = originalSite.nav.flatMap(item => 'children' in item && item.children ? [...item.children] : []);

export function Footer({ phone, email }: { phone: string; email: string }) {
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`;

  return (
    <footer className="site-footer">
      <div className="shell footer-brand-row">
        <Link className="footer-logo" href="/" aria-label="Aksen Photo — strona główna">
          <Image src={originalSite.logo.src} alt={originalSite.logo.alt} width={260} height={74} sizes="220px" />
        </Link>
        <div className="footer-social" aria-label="Aksen Photo w social media">
          {originalSite.social.map(item => (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}><SocialIcon name={item.label} /></a>
          ))}
        </div>
      </div>

      <div className="shell footer-grid footer-grid-expanded">
        <div>
          <p className="eyebrow light">Kontakt</p>
          <p>{originalSite.contact.location}</p>
          <p><a href={phoneHref}>{phone}</a><br/><a href={`mailto:${email}`}>{email}</a></p>
          <Link className="footer-cta" href="/rezerwacja">Sprawdź termin →</Link>
        </div>

        <div>
          <p className="footer-heading">Menu</p>
          <nav className="footer-links" aria-label="Menu w stopce">
            <Link href="/">Strona Główna</Link>
            <Link href="/o-mnie-fotograf-szczecin/" prefetch={false}>O mnie</Link>
            <Link href="/#wybierz-fotografie">Oferta</Link>
            <Link href="/blog-fotograficzny/" prefetch={false}>Blog</Link>
            <Link href="/kontakt-fotograf-szczecin-aksen-photo/" prefetch={false}>Kontakt</Link>
          </nav>
        </div>

        <div className="footer-offer-column">
          <p className="footer-heading">Oferta</p>
          <nav className="footer-links footer-offer-links" aria-label="Kategorie fotografii">
            {offerNav.map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
          </nav>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Aksen Photo</span>
        <div>
          <Link href="/polityka-prywatnosci-plikow-cookies-fotografa/" prefetch={false}>Polityka prywatności i regulamin usług</Link>
        </div>
      </div>
    </footer>
  );
}
