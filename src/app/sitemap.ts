import type { MetadataRoute } from 'next';
import { getArticles, getReportages } from '@/lib/wp';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fotografslubny.szczecin.pl';
  const staticPaths = ['', '/reportaze', '/oferta', '/o-mnie', '/opinie', '/faq', '/poradnik', '/kontakt', '/rezerwacja', '/polityka-prywatnosci'];
  const [reportages, articles] = await Promise.all([getReportages(), getArticles()]);
  return [
    ...staticPaths.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === '' ? 'weekly' as const : 'monthly' as const, priority: path === '' ? 1 : .7 })),
    ...reportages.map(item => ({ url: `${base}/reportaze/${item.slug}`, lastModified: item.date ? new Date(item.date) : new Date(), changeFrequency: 'monthly' as const, priority: .8 })),
    ...articles.map(item => ({ url: `${base}/poradnik/${item.slug}`, lastModified: item.date ? new Date(item.date) : new Date(), changeFrequency: 'monthly' as const, priority: .65 }))
  ];
}
