import { fallbackData } from '@/lib/fallback';
import type { Article, FaqItem, Reportage, Review, SiteData } from '@/types/content';

const base = process.env.WORDPRESS_URL?.replace(/\/$/, '') || '';

async function request<T>(path: string, revalidate = 300): Promise<T | null> {
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(3500)
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getSiteData(): Promise<SiteData> {
  const data = await request<Partial<SiteData>>('/wp-json/aksen-headless/v1/site', 300);
  if (!data) return fallbackData;
  return {
    ...fallbackData,
    ...data,
    brand: { ...fallbackData.brand, ...(data.brand || {}) },
    offer: { ...fallbackData.offer, ...(data.offer || {}) },
    reportages: data.reportages || [],
    reviews: data.reviews || [],
    faq: data.faq || fallbackData.faq,
    articles: data.articles || [],
    otherServices: data.otherServices || fallbackData.otherServices
  };
}

export async function getReportages(): Promise<Reportage[]> {
  const data = await request<Reportage[]>('/wp-json/aksen-headless/v1/reportages', 300);
  return data || [];
}

export async function getReportage(slug: string): Promise<Reportage | null> {
  return request<Reportage>(`/wp-json/aksen-headless/v1/reportages/${encodeURIComponent(slug)}`, 300);
}

export async function getReviews(): Promise<Review[]> {
  return (await request<Review[]>('/wp-json/aksen-headless/v1/reviews', 600)) || [];
}

export async function getFaq(): Promise<FaqItem[]> {
  return (await request<FaqItem[]>('/wp-json/aksen-headless/v1/faq', 600)) || fallbackData.faq;
}

export async function getArticles(): Promise<Article[]> {
  return (await request<Article[]>('/wp-json/aksen-headless/v1/articles', 600)) || [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  return request<Article>(`/wp-json/aksen-headless/v1/articles/${encodeURIComponent(slug)}`, 600);
}
