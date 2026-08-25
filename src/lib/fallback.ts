import type { SiteData } from '@/types/content';

export const fallbackData: SiteData = {
  brand: {
    name: 'Aksen Photo',
    headline: 'Zatrzymuję emocje, zanim znikną',
    subheadline: 'Naturalne reportaże ślubne w Szczecinie, Zachodniopomorskiem, Polsce i Niemczech.',
    intro: 'Nie reżyseruję Waszego dnia. Obserwuję, przewiduję i zapisuję spojrzenia, gesty, śmiech oraz wszystko to, czego nie da się powtórzyć.',
    about: 'Fotografia pojawiła się w moim życiu, gdy zrozumiałem, jak szybko ulatują najpiękniejsze chwile. Od ponad 10 lat fotografuję ludzi i ich emocje. W dniu ślubu jestem obok, ale nie w centrum. Nie ustawiam Was i nie przerywam momentów, które dzieją się naprawdę.',
    phone: '+48 518 20 20 89',
    email: 'aksen.fotografia@gmail.com',
    instagram: 'https://www.instagram.com/aksen_photo/'
  },
  offer: {
    title: 'Pełny reportaż ślubny, który opowiada cały dzień',
    intro: 'Zakres dopasowujemy do Waszego planu. Najważniejsze jest to, żeby historia była kompletna: od przygotowań i ceremonii, przez rodzinę i przyjaciół, po energię wesela.',
    bullets: ['reportaż ślubny i weselny', 'krótka sesja w dniu ślubu', 'autorska selekcja i obróbka', 'prywatna galeria online', 'konsultacja przed ślubem', 'możliwość realizacji w Polsce i Niemczech'],
    videoBonus: 'Do reportażu otrzymujecie również krótki teledysk z Waszego dnia.'
  },
  otherServices: [
    { title: 'Sesje narzeczeńskie', url: 'https://aksen-photo.pl/fotografia-narzeczenska/', description: 'Naturalne sesje dla par przed ślubem.' },
    { title: 'Fotografia rodzinna', url: 'https://aksen-photo.pl/fotografia-rodzinna/', description: 'Rodzinne historie poza sezonem ślubnym.' },
    { title: 'Fotografia wizerunkowa', url: 'https://aksen-photo.pl/fotografia-wizerunkowa-i-biznesowa/', description: 'Wizerunek dla marek osobistych i firm.' }
  ],
  reportages: [],
  reviews: [],
  faq: [
    { id: 'f1', question: 'Czy pomagacie osobom, które nie lubią pozować?', answer: 'Tak. Większość par na początku mówi dokładnie to samo. Podpowiadam tylko wtedy, gdy jest to potrzebne, a przez większość dnia pozwalam Wam po prostu być razem.' },
    { id: 'f2', question: 'Czy dojeżdżasz poza Szczecin?', answer: 'Tak. Fotografuję w całym województwie zachodniopomorskim, w innych częściach Polski oraz na ślubach polsko-niemieckich.' },
    { id: 'f3', question: 'Czy możemy zarezerwować krótszy reportaż?', answer: 'Tak. Zakres zależy od planu dnia i rodzaju uroczystości. Po poznaniu szczegółów proponuję rozwiązanie, które ma sens dla Waszego ślubu.' },
    { id: 'f4', question: 'Czy otrzymamy galerię online?', answer: 'Tak. Gotowe zdjęcia trafiają do prywatnej galerii, którą możecie wygodnie udostępniać rodzinie i znajomym.' }
  ],
  articles: []
};
