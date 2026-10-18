/**
 * What a service card is allowed to point at: only artifacts that are
 * actually built. `test/brand-registries.test.ts` resolves every path,
 * so a card can never promise a page that does not exist.
 */
export type Proof =
  /** A delivered client site served by this app. */
  | { kind: 'site'; path: string }
  /** One of our own live product apps. */
  | { kind: 'product'; path: string }
  /** A founder case study under /portfolio. */
  | { kind: 'case'; path: string };
