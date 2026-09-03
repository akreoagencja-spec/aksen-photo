import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/Gallery';
import { getReportage } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getReportage(slug);
  if (!item) return makeMetadata('Reportaż ślubny', 'Pełny reportaż ślubny Aksen Photo.', `/reportaze/${slug}/`);
  return makeMetadata(item.title, item.excerpt, `/reportaze/${item.slug}/`, item.hero?.url);
}

export default async function ReportagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getReportage(slug);
  if (!item) notFound();
  return <main>
    <section className="page-hero"><div className="shell"><p className="eyebrow">Pełny reportaż ślubny</p><h1>{item.title}</h1><div className="story-meta">{item.location && <span>{item.location}</span>}{item.venue && <span>{item.venue}</span>}{item.date && <span>{item.date}</span>}</div><p>{item.excerpt}</p></div></section>
    {item.hero && <div className="shell"><Image src={item.hero.url} alt={item.hero.alt || item.title} width={item.hero.width || 2000} height={item.hero.height || 1300} priority sizes="100vw" /></div>}
    {item.content && <section className="section"><div className="shell rich-content" dangerouslySetInnerHTML={{ __html: item.content }} /></section>}
    <section className="section"><div className="shell"><Gallery items={item.gallery} /></div></section>
    <section className="section muted-section"><div className="shell"><div className="section-head"><p className="eyebrow">Wasza historia</p><h2>Chcecie podobny reportaż?</h2><p>Opowiedzcie mi o swoim dniu. Sprawdzę termin i przygotuję propozycję dopasowaną do planu uroczystości.</p></div><Link className="button" href="/rezerwacja/">Sprawdź termin</Link></div></section>
  </main>;
}
