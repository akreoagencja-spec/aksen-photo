import type { Metadata } from 'next';
import { PostCard } from '@/components/v2/PostCard';
import { getLatestPosts } from '@/lib/cms-v2';
import { siteV2 } from '@/lib/site-v2';

export const metadata: Metadata = {
  title: 'Blog fotograficzny – Aksen Photo | Fotograf Szczecin',
  description: 'Reportaże, sesje i praktyczne artykuły fotograficzne Aksen Photo ze Szczecina.',
  alternates: { canonical: `${siteV2.url}/blog-fotograficzny/` }
};

export default async function BlogPage() {
  const posts = await getLatestPosts(24);
  return (
    <main className="inner-page-v2">
      <section className="inner-hero-v2 inner-hero-simple-v2">
        <div className="page-shell-v2">
          <p className="kicker-v2">Aksen Photo</p>
          <h1>Blog fotograficzny</h1>
          <p>Prowadzę blog fotograficzny, na którym dzielę się ostatnimi kadrami, reportażami ze ślubów, chrztów, sesji rodzinnych oraz praktycznymi poradami. Każdy wpis traktuję jak osobną historię.</p>
        </div>
      </section>
      <section className="section-v2">
        <div className="page-shell-v2">
          {posts.length ? <div className="post-grid-v2">{posts.map((post, index) => <PostCard key={post.id} item={post} featured={index === 0} />)}</div> : <div className="empty-state-v2">Nie udało się teraz pobrać wpisów z aktualnego WordPressa.</div>}
        </div>
      </section>
    </main>
  );
}
