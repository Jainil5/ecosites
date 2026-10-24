'use client';

import { useEffect, useRef, useState } from 'react';
import { WhatsAppGlyph } from '@/components/brand/WhatsAppGlyph';
import { company } from '@/content/brand/company';
import { whatsappHrefMessage } from '@/content/brand/links';

/** Opening a chat should already say what the tap is for. */
const enquiry =
  'Hi Website & Intelligence! I have a question about what you would build for my business, and how pricing works.';

/**
 * The enquiry channel, kept in reach on every brand page. It floats over
 * scrolling content, so it samples its own footprint and stands down while
 * anything clickable is sitting under it — a second button must never cost a
 * reader the link they were aiming at.
 */
export function WhatsAppFab() {
  const fab = useRef<HTMLAnchorElement>(null);
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    const el = fab.current;
    if (!el) return;
    let frame = 0;

    const check = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const corners = [
        [r.left + 3, r.top + 3],
        [r.right - 3, r.top + 3],
        [r.left + 3, r.bottom - 3],
        [r.right - 3, r.bottom - 3],
      ];
      for (const [x, y] of corners) {
        for (const node of document.elementsFromPoint(x, y)) {
          if (node === el || el.contains(node)) continue;
          if (node.closest('a,button,input,select,textarea,summary')) {
            setTucked(true);
            return;
          }
        }
      }
      setTucked(false);
    };

    // One rAF per scroll, and the sampling is four stack lookups, so the
    // plate keeps its own frame budget instead of borrowing the page's.
    const onMove = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    addEventListener('scroll', onMove, { passive: true });
    addEventListener('resize', onMove);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      removeEventListener('scroll', onMove);
      removeEventListener('resize', onMove);
    };
  }, []);

  return (
    <a
      ref={fab}
      href={whatsappHrefMessage(company.contact, enquiry)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Send us a WhatsApp message about your business or pricing"
      data-tucked={tucked ? 'true' : 'false'}
      tabIndex={tucked ? -1 : undefined}
      className="gs-wa focus-ring"
    >
      <span className="gs-wa-plate">
        <WhatsAppGlyph className="gs-wa-mark" />
      </span>
      <span className="gs-wa-tag">Ask about your brand or pricing</span>
    </a>
  );
}
