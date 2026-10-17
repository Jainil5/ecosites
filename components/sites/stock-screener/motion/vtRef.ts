'use client';

import type { RefCallback } from 'react';

const cache = new Map<string, RefCallback<HTMLElement>>();

/**
 * Ref callback that applies `view-transition-name` imperatively. React's
 * style prop serializes `viewTransitionName` to lowercase
 * `view-transition-name`, which browsers drop from inline style attributes,
 * silently killing the morph. Cached per name so React never re-invokes (and
 * framer-motion style writes never trigger a cleanup that would wipe it).
 */
export function vtRef<T extends HTMLElement>(name: string): RefCallback<T> {
  let ref = cache.get(name);
  if (!ref) {
    ref = (el) => el?.style.setProperty('view-transition-name', name);
    cache.set(name, ref);
  }
  return ref;
}
