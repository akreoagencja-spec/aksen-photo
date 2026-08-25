import { ReportageCard } from '@/components/ReportageCard';
import { getReportages } from '@/lib/wp';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata('Reportaże ślubne Szczecin', 'Pełne reportaże ślubne Aksen Photo. Zobacz całe historie ze Szczecina, Zachodniopomorskiego, Polski i Niemiec.', '/reportaze');

export default async function ReportagesPage() {
  const items = await getReportages();
  return <main><section className="page-hero"><div className="shell"><p className="eyebrow">Portfolio</p><h1>Pełne historie ślubne</h1><p>Nie tylko najlepszych kilkanaście zdjęć. Zobaczcie cały rytm dnia: przygotowania, ceremonię, emocje bliskich, światło i wesele.</p></div></section><section className="section"><div className="shell">{items.length ? <div className="story-grid">{items.map((item,index)=><ReportageCard item={item} key={item.id} featured={index===0}/>)}</div> : <div className="empty-state">Brak opublikowanych reportaży. Oznacz ślubne historie w WordPressie, a pojawią się tutaj automatycznie.</div>}</div></section></main>;
}
