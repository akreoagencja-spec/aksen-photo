'use client';

import { useState } from 'react';
import { trackPrimaryLead } from '@/lib/conversions';

export function ContactForm() {
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  async function submit(formData: FormData) {
    setState('sending');
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (response.ok) {
      setState('sent');
      trackPrimaryLead('form');
    } else {
      setState('error');
    }
  }
  return <form className="contact-form" action={submit}>
    <div className="form-honeypot" aria-hidden="true"><label>Strona internetowa<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="form-row"><label>Imię i nazwisko<input name="name" required autoComplete="name" maxLength={120} /></label><label>E-mail<input type="email" name="email" required autoComplete="email" maxLength={254} /></label></div>
    <div className="form-row"><label>Telefon<input name="phone" autoComplete="tel" maxLength={50} /></label><label>Data ślubu<input type="date" name="date" /></label></div>
    <label>Miejsce ceremonii / wesela<input name="place" maxLength={200} /></label>
    <label>Opowiedzcie mi o swoim dniu<textarea name="message" required rows={6} minLength={10} maxLength={5000} /></label>
    <label className="consent"><input type="checkbox" name="privacy" value="1" required /> Akceptuję politykę prywatności i kontakt w sprawie zapytania.</label>
    <button className="button" disabled={state === 'sending'}>{state === 'sending' ? 'Wysyłam…' : 'Sprawdź dostępność terminu'}</button>
    {state === 'sent' && <p className="form-success">Dziękuję. Wiadomość została wysłana.</p>}
    {state === 'error' && <p className="form-error">Nie udało się wysłać wiadomości. Zadzwoń lub napisz e-mail.</p>}
  </form>;
}
