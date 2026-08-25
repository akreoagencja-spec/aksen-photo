'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackContactPageView, trackEmailClick, trackOutboundClick, trackPhoneClick, trackScroll90 } from '@/lib/conversions';

export function TrackingEvents() {
  const pathname = usePathname();
  const scrolled = useRef(false);

  useEffect(() => {
    if (pathname === '/kontakt' || pathname === '/rezerwacja') trackContactPageView(pathname);
    scrolled.current = false;
  }, [pathname]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('tel:')) trackPhoneClick(href);
      else if (href.startsWith('mailto:')) trackEmailClick(href);
      else if (/^https?:\/\//i.test(href)) {
        const target = new URL(href, window.location.href);
        if (target.hostname !== window.location.hostname) trackOutboundClick(target.href);
      }
    };
    const scroll = () => {
      if (scrolled.current) return;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height > 0 && window.scrollY / height >= 0.9) {
        scrolled.current = true;
        trackScroll90(window.location.pathname);
      }
    };
    document.addEventListener('click', click);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      document.removeEventListener('click', click);
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  return null;
}
