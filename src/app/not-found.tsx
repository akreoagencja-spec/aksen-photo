import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="inner-page-v2">
      <section className="inner-hero-v2 inner-hero-simple-v2">
        <div className="page-shell-v2">
          <p className="kicker-v2">404</p>
          <h1>Nie znalazłem tej strony.</h1>
          <p>Adres mógł się zmienić albo nie istnieje w aktualnym Aksen Photo.</p>
          <div className="hero-actions-v2">
            <Link className="button" href="/">Strona główna</Link>
            <Link className="button button-secondary" href="/kontakt-fotograf-szczecin-aksen-photo/">Kontakt</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
