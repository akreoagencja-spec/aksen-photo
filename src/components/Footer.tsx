import Link from 'next/link';

export function Footer({ phone, email }: { phone: string; email: string }) {
  return <footer className="site-footer">
    <div className="shell footer-grid">
      <div><p className="eyebrow">Aksen Photo</p><h2>Historie, które zostają z Wami.</h2></div>
      <div><p>Szczecin · Zachodniopomorskie · Polska · Niemcy</p><p><a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a><br/><a href={`mailto:${email}`}>{email}</a></p></div>
      <div><Link href="/rezerwacja">Rezerwacja</Link><br/><Link href="/kontakt">Kontakt</Link><br/><Link href="/faq">FAQ</Link><br/><Link href="/polityka-prywatnosci">Polityka prywatności</Link></div>
    </div>
  </footer>;
}
