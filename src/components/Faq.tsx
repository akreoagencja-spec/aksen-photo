import type { FaqItem } from '@/types/content';

export function Faq({ items }: { items: FaqItem[] }) {
  return <div className="faq-list">{items.map(item => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
}
