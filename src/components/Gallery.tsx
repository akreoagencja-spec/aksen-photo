import Image from 'next/image';
import type { MediaItem } from '@/types/content';

export function Gallery({ items }: { items: MediaItem[] }) {
  return <div className="story-gallery">{items.map((item, index) => <figure key={`${item.id}-${index}`} className={index % 7 === 0 ? 'gallery-wide' : ''}><Image src={item.url} alt={item.alt || 'Reportaż ślubny Aksen Photo'} width={item.width || 1600} height={item.height || 1200} sizes={index % 7 === 0 ? '100vw' : '(max-width: 760px) 100vw, 50vw'} /></figure>)}</div>;
}
