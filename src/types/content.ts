export type MediaItem = {
  id: number | string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Reportage = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  location?: string;
  venue?: string;
  date?: string;
  hero?: MediaItem;
  gallery: MediaItem[];
  content?: string;
};

export type Review = {
  id: number | string;
  name: string;
  text: string;
  source?: string;
};

export type FaqItem = {
  id: number | string;
  question: string;
  answer: string;
};

export type Article = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  hero?: MediaItem;
  date?: string;
};

export type SiteData = {
  brand: {
    name: string;
    headline: string;
    subheadline: string;
    intro: string;
    about: string;
    phone: string;
    email: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  offer: {
    title: string;
    intro: string;
    bullets: string[];
    videoBonus: string;
  };
  otherServices: Array<{ title: string; url: string; description: string }>;
  reportages: Reportage[];
  reviews: Review[];
  faq: FaqItem[];
  articles: Article[];
};
