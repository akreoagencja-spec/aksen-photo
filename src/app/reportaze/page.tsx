import { ReportageCard } from '@/components/ReportageCard';
import { getPublicReportages } from '@/lib/wp-public';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Reportaże ślubne Szczecin', 'Pełne reportaże ślubne Aksen Photo. Zobacz całe historie ze Szczecina, Zachodniopomorskiego, Polski i Niemiec.', '/reportaze');

export default async function ReportagesPage() {
  const items = await getPublicReportages();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Portfolio</p><h1>Pełne historie ślubne</h1><p>Nie tylko najlepszych kilkanaście zdjęć. Zobaczcie cały rytm dnia: przygotowania, ceremonię, emocje bliskich, światło i wesele.</p></div></section><section className="section"><div className="shell">{items.length ? <div className="story-grid">{items.map((item,index)=><ReportageCard item={item} key={item.id} featured={index===0}/>)}</div> : <div className="empty-state">Brak opublikowanych reportaży.</div>}</div></section></main>;
}
