import Image from 'next/image';
import Link from 'next/link';
import { siteV2 } from '@/lib/site-v2';

export function SiteFooter() {
  return (
    <footer className="site-footer-v2">
      <div className="footer-shell-v2">
        <div className="footer-top-v2">
          <div className="footer-brand-v2">
            <Link href="/" aria-label="Aksen Photo — strona główna">
              <Image src={siteV2.logo.src} alt={siteV2.logo.alt} width={260} height={74} sizes="190px" />
            </Link>
            <p>Naturalna fotografia ślubna, rodzinna i wizerunkowa. Szczecin i całe Zachodniopomorskie.</p>
          </div>

          <div>
            <p className="footer-heading-v2">Menu</p>
            <nav className="footer-links-v2" aria-label="Menu w stopce">
              {siteV2.nav.map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
            </nav>
          </div>

          <div className="footer-offer-v2">
            <p className="footer-heading-v2">Oferta</p>
            <nav className="footer-links-v2 footer-offer-links-v2" aria-label="Oferta fotograficzna">
              {siteV2.offerLinks.map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
            </nav>
          </div>

          <div>
            <p className="footer-heading-v2">Kontakt</p>
            <div className="footer-links-v2">
              <span>{siteV2.contact.location}</span>
              <a href={siteV2.contact.phoneHref}>{siteV2.contact.phoneDisplay}</a>
              <a href={siteV2.contact.emailHref}>{siteV2.contact.email}</a>
            </div>
            <div className="footer-social-v2">
              {siteV2.social.map(item => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>)}
            </div>
          </div>
        </div>

        <div className="footer-bottom-v2">
          <span>© {new Date().getFullYear()} Aksen Photo</span>
          <div>
            <Link href="/polityka-prywatnosci-plikow-cookies-fotografa/" prefetch={false}>Polityka prywatności</Link>
            <Link href="/regulamin-zakupow/" prefetch={false}>Regulamin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
