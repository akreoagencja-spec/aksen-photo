'use client';

import { FormEvent, useState } from 'react';

const photoTypes = [
  'Fotografia ślubna',
  'Fotografia narzeczeńska',
  'Fotografia rodzinna',
  'Chrzest Święty',
  'Komunia Święta',
  'Fotografia kobieca',
  'Fotografia wizerunkowa i biznesowa',
  '18 urodziny',
  'Fotografia produktowa',
  'Sesja ciążowa i noworodkowa',
  'Wieczór panieński',
  'Inne'
];

export function ContactFormV2() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      type: String(data.get('type') || ''),
      message: String(data.get('message') || ''),
      privacy: data.get('privacy') ? '1' : '0',
      company: String(data.get('company') || '')
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('send');
      form.reset();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  return (
    <form className="contact-form-v2" onSubmit={submit}>
      <div className="form-honeypot-v2" aria-hidden="true">
        <label>Firma<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="form-row-v2">
        <label>Imię<input name="name" required autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <div className="form-row-v2">
        <label>Telefon<input name="phone" type="tel" autoComplete="tel" /></label>
        <label>Rodzaj fotografii<select name="type" defaultValue=""><option value="" disabled>Wybierz</option>{photoTypes.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label>Opowiedz mi o swoim pomyśle<textarea name="message" required rows={7} /></label>
      <label className="form-consent-v2"><input type="checkbox" name="privacy" required /><span>Wyrażam zgodę na kontakt w sprawie mojego zapytania i akceptuję politykę prywatności.</span></label>
      <button className="button" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Wysyłam…' : 'Wyślij wiadomość'}</button>
      {state === 'sent' ? <p className="form-status-v2 success">Wiadomość została wysłana. Odezwę się możliwie szybko.</p> : null}
      {state === 'error' ? <p className="form-status-v2 error">Nie udało się wysłać formularza. Na stagingu możesz skorzystać z telefonu lub e-maila podanych obok.</p> : null}
    </form>
  );
}
