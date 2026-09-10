import Image from 'next/image';
import Link from 'next/link';
import type { CmsItem } from '@/lib/cms-v2';

export function PostCard({ item, featured = false }: { item: CmsItem; featured?: boolean }) {
  return (
    <article className={featured ? 'post-card-v2 post-card-v2-featured' : 'post-card-v2'}>
      <Link href={`${item.path}/`.replace('//', '/')} prefetch={false}>
        <div className="post-card-media-v2">
          {item.image ? (
            <Image src={item.image} alt={item.imageAlt || item.title} fill sizes={featured ? '(max-width: 760px) 100vw, 62vw' : '(max-width: 760px) 88vw, 34vw'} />
          ) : <div className="media-placeholder-v2" />}
        </div>
        <div className="post-card-copy-v2">
          <p className="kicker-v2">{item.type === 'post' ? 'Historia / artykuł' : 'Aksen Photo'}</p>
          <h3>{item.title}</h3>
          {item.excerpt ? <p>{item.excerpt}</p> : null}
          <span>Czytaj dalej <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
