# Green "cut-plane" brand skin — 3D + gooey, replacing the freehand direction

Date: 2026-10-17 · Status: approved by Jainil ("Go and start building") · Supersedes:
`2026-10-16-freehand-skin-design.md` for all *visual language* decisions.

## Why the pivot

Jainil saw the in-progress result and judged it "much more basic" than he wants. He pointed at
two Skillry deck skills (`bs-editable-visual-deck`, `bs-inclusive-cutpaper-deck`) as the form he
wants, then added "green based theme" and "3D motion design". He chose **switch**, not layer.
The freehand plan's austere serif-300 restraint was the specific thing being rejected — including
the "no rotateX and no translateZ" rule I had written into `wi-*`.

## Reference form, sampled from pixels (not from its marketing copy)

`https://skillry.dev/skills/bs-editable-visual-deck/media/preview-1.webp`, sampled with Pillow:

| token | sampled | role |
|---|---|---|
| canvas | `#EAE6F3` | flat tinted paper, not white, not cream |
| ink | `#17131B` | near-black with a cool undertone |
| plane A | `#ED4B3E` | rotated flat block, ~3° |
| plane B | `#8E7BC8` | second rotated block, overlapping A |
| label | mono, uppercase, tracked | three corner labels, one in a hot accent |
| headline | grotesk ~800, ALL CAPS, tight leading | overlaps the planes, clipped by the grid |
| grid | hairlines at 1/3 and 1/2 | a *visible* construction grid |

Signature = flat rotated colour planes + poster-scale heavy caps + visible layout grid + mono
corner labels. Zero radius, zero shadow, zero gradient.

## Locked decisions

- **Green translation.** Canvas `#E9F0EA` pale sage · ink `#0B1410` · plane A `#22C55E` (the
  existing mark green, so the logo stops being the odd one out) · plane B `#14532D` deep forest ·
  label accent `#BEF264` lime. The hot accent is retained because two greens alone go muddy.
- **Type.** `--font-display` → **Archivo** (variable grotesque, heavy caps are the whole point),
  weight 700/800. **Source Serif 4 is deleted.** Geist Mono stays as `--font-label`. Fustat is
  dropped as `--font-body`; body copy moves to Archivo at low weight.
- **Never repoint `--font-sans` or `--font-mono`** — Dream Cafe and 13 screener files own them.
  Same guard as the freehand plan: `test/brand-skin.test.ts` asserts they still resolve to their
  own variables.
- **Gooey without dependencies.** SVG filter (`feGaussianBlur` → `feColorMatrix` alpha step)
  applied to a wrapper so adjacent blobs fuse on approach. Used sparingly: the hero CTA cluster
  and the section-index rail. Never on text — goo filters destroy glyph edges.
- **3D is real, not decorative.** Reuse the repo's existing vocabulary: `.scene` perspective,
  `.plate` + `translateZ`, `plate-explode`, `Tilt3D`, `Reveal`, `AnimatedNumber`, and the
  View-Transition plumbing in `components/sites/stock-screener/motion/`. `framer-motion@12` is
  already a dependency; **no npm install of any kind.**
- **Honesty rules unchanged.** No invented numbers, funding, awards, press quotes. No "Pune" or
  city names in rendered strings. No `demo` wording on `/store`. No `₹`/prices in `company.*` or
  `products.*` marketing fields.
- **No commits.** Jainil declined the baseline commit and every per-task commit.

## Homepage bands

1. **Hero** — poster caps over two depth-separated planes, pointer parallax, gooey CTA cluster,
   mono corner labels, visible grid.
2. **Interactive compiler** — "type your business name → see your site", moved up into the hero's
   own band because it is the single best thing on the site.
3. **Proof** — live counters (`AnimatedNumber`), derived from `websites.length`, never hardcoded.
4. **Services journey** — Get Found → Known → Running → Smart, as a 3D rail.
5. **Products** — flat planes as cards, tilt on hover.
6. **Demos** — real screenshots in browser chrome, View-Transition morph into detail.
7. **Comparison** — agency vs us, from `comparisonRows`.
8. **Stack** — grouped, derived from `sites.ts` `techStack`.
9. **Contact CTA**.

## Verification

`npx vitest run` + `npm run build` clean at every task end. Browser pass on a **pinned free
port** (never `:3000` — that is his `npm start` serving a stale build) at 1440px and 390px;
reduced-motion emulation; goo filter checked in Safari as well as Chrome; demo routes
(`/stock-screener`, `/hair-adore`, `/savour`, `/dream-cafe`) visually unchanged.

## Known costs

- Freehand Tasks 1–2 partially unwind: the serif display font is deleted, `wi-*` primitives are
  renamed/retargeted rather than thrown away.
- The `go-*` (saze-era) CSS still has to be deleted; with no baseline commit it is unrecoverable
  once removed. Same warning as before, still accepted.
