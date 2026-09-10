import { META_PIXEL_ID } from './analytics';

let initialized = false;

export function initializeMetaPixel() {
  if (typeof window === 'undefined' || initialized || !META_PIXEL_ID) return;
  const w = window as typeof window & { _fbq?: unknown; fbq?: (...args: unknown[]) => void };
  if (!w.fbq) {
    const fbq = function (...args: unknown[]) {
      const fn = fbq as unknown as { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
      if (fn.callMethod) fn.callMethod(...args);
      else (fn.queue ||= []).push(args);
    } as unknown as ((...args: unknown[]) => void) & { push?: unknown; loaded?: boolean; version?: string; queue?: unknown[] };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    w.fbq = fbq;
    w._fbq = fbq;
  }
  w.fbq?.('init', META_PIXEL_ID);
  w.fbq?.('track', 'PageView');
  initialized = true;
}
