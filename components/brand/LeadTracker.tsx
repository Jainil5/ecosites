'use client';

import { useEffect } from 'react';
import { leadChannelOf } from '@/content/brand/links';

/**
 * One delegated listener for every enquiry link on the brand pages. The
 * placements are server components — a click cannot be counted from there — so
 * attribution is a `data-cta` attribute on the anchor and nothing else.
 *
 * What leaves the page is a placement id, a channel and a pathname. Never the
 * href: the prefilled WhatsApp message carries what the visitor typed, and
 * that is not ours to log.
 */
export function LeadTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[data-cta]');
      const href = link?.getAttribute('href') ?? '';
      const channel = link ? leadChannelOf(href) : null;
      if (!link || !channel) return;

      const body = JSON.stringify({
        placement: link.dataset.cta,
        channel,
        path: location.pathname,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/lead', new Blob([body], { type: 'application/json' }));
      } else {
        void fetch('/api/lead', {
          method: 'POST',
          body,
          headers: { 'content-type': 'application/json' },
          keepalive: true,
        });
      }
    };
    addEventListener('click', onClick, true);
    return () => removeEventListener('click', onClick, true);
  }, []);

  return null;
}
