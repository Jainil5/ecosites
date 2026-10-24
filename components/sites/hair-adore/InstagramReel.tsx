'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Reel } from './data';

// Instagram's public embed iframes report their height via postMessage;
// the message is a JSON string mentioning the embed URL, so match on the reel id.
export function InstagramReel({ reel }: { reel: Reel }) {
  const id = reel.url.match(/\/(?:reel|p)\/([^/]+)\/?/)?.[1];
  const src = id ? `https://www.instagram.com/reel/${id}/embed/captioned/` : null;
  const [height, setHeight] = useState(540);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== 'string' || !e.data.includes(id)) return;
      try {
        const payload = JSON.parse(e.data);
        if (typeof payload.height === 'number' && payload.height > 200) {
          setHeight(Math.min(payload.height + 40, 900));
        }
      } catch {
        /* not a resize message for this reel */
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [id]);

  if (!src) return null;

  return (
    <div className="ha-shadow flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex-1 overflow-hidden bg-stone-50">
        {failed ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-stone-500">Video preview couldn&apos;t load.</p>
            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-[#C1613C] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
            >
              <ExternalLink aria-hidden className="h-3.5 w-3.5" /> Watch on Instagram
            </a>
          </div>
        ) : (
          <iframe
            src={src}
            title={reel.title}
            loading="lazy"
            scrolling="no"
            onError={() => setFailed(true)}
            style={{ height, width: '100%', border: 0 }}
          />
        )}
      </div>
      <div className="px-5 py-3">
        <h4 className="font-serif text-base text-[#9E4A2B]">{reel.title}</h4>
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-0.5 inline-flex min-h-10 items-center gap-1 text-xs text-stone-500 transition-colors hover:text-[#C1613C]"
        >
          <ExternalLink aria-hidden className="h-3 w-3" /> Open Instagram reel
        </a>
      </div>
    </div>
  );
}
