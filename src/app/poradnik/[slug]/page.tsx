import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const item = await getArticle(slug);
  return item ? makeMetadata(item.title, item.excerpt, `/poradnik/${slug}`, item.hero?.url) : makeMetadata('Poradnik ślubny', 'Poradnik ślubny Aksen Photo.', `/poradnik/${slug}`);
}

export default async function ArticlePage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const item = await getArticle(slug);
  if (!item) notFound();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Poradnik ślubny</p><h1>{item.title}</h1><p>{item.excerpt}</p></div></section>{item.hero&&<div className="shell"><Image src={item.hero.url} alt={item.hero.alt||item.title} width={item.hero.width||1800} height={item.hero.height||1100} priority sizes="100vw"/></div>}<section className="section"><div className="shell rich-content" dangerouslySetInnerHTML={{__html:item.content}}/></section></main>;
}
