export function SocialIcon({ name }: { name: string }) {
  const key = name.toLowerCase();
  if (key.includes('instagram')) return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>;
  if (key.includes('facebook')) return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M13.7 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.4Z"/></svg>;
  if (key.includes('tiktok')) return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M14.5 3h3c.2 1.6 1.2 2.9 2.8 3.6v3.1c-1.1 0-2.1-.3-3-.8v6.3a6.1 6.1 0 1 1-5.2-6v3.2a3 3 0 1 0 2.4 2.9V3Z"/></svg>;
  if (key.includes('youtube')) return <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M21 7.3a3 3 0 0 0-2.1-2.1C17 4.7 12 4.7 12 4.7s-5 0-6.9.5A3 3 0 0 0 3 7.3 31 31 0 0 0 2.6 12 31 31 0 0 0 3 16.7a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.7 31 31 0 0 0-.4-4.7ZM10.1 15.1V8.9L15.5 12l-5.4 3.1Z"/></svg>;
  if (key.includes('phone') || key.includes('tel')) return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.2 3.8 8.4 3l2 4.7-2 1.4a14.8 14.8 0 0 0 6.5 6.5l1.4-2 4.7 2-.8 3.2a2.2 2.2 0 0 1-2.3 1.7A16.4 16.4 0 0 1 3.5 6.1a2.2 2.2 0 0 1 1.7-2.3Z"/></svg>;
  return <span aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>;
}
