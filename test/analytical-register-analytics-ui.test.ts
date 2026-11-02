// test/analytical-register-analytics-ui.test.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
const DIR = 'components/sites/analytical-register';

/**
 * The analytics screen is the part of OrderBook a buyer is most likely to
 * believe, so it has to answer to a pointer. These checks keep the promises the
 * charts make — a line you can read, a bar you can select, a grid you can open,
 * a ring that filters the whole report and a report you can take away.
 */

describe('the revenue line', () => {
  const src = read(`${DIR}/charts/Line.tsx`);

  it('reads any day under the pointer, not only the last one', () => {
    expect(src).toMatch(/onPointerEnter=\{\(\) => setActive\(i\)\}/);
    expect(src).toMatch(/const shown = active \?\?/);
    // A hit slice per day, so sweeping the chart needs no coordinate maths.
    expect(src).toMatch(/data\.map\(\(d, i\) => \(\n\s+<rect/);
  });

  it('announces what it is reading', () => {
    expect(src).toMatch(/aria-live="polite"/);
    expect(src).toMatch(/shortDate\(point\.date\)/);
    expect(src).toMatch(/format\(point\.revenue\)/);
    expect(src).toMatch(/bills/);
  });

  it('pins the day it is pointed at, and opens the day underneath', () => {
    expect(src).toMatch(/onSelect\?: \(date: string\) => void/);
    expect(src).toMatch(/onClick=\{\(\) => onSelect\?\.\(d\.date\)\}/);
    expect(src).toMatch(/selected\?: string \| null/);
  });

  it('is readable without a mouse', () => {
    expect(src).toMatch(/tabIndex=\{0\}/);
    expect(src).toMatch(/e\.key === 'ArrowRight'/);
    expect(src).toMatch(/e\.key === 'Enter'/);
    expect(src).toMatch(/role="group"/);
  });
});

describe('the rest of the charts', () => {
  it('turns every column bar into a control when the page asks for one', () => {
    const src = read(`${DIR}/charts/Column.tsx`);
    expect(src).toMatch(/onSelect\?: \(label: string\) => void/);
    expect(src).toMatch(/role=\{onSelect \? 'button' : undefined\}/);
    expect(src).toMatch(/tabIndex=\{onSelect \? 0 : undefined\}/);
    expect(src).toMatch(/aria-pressed=\{onSelect \? on : undefined\}/);
    // Selecting a bar must look different, not just report a state.
    expect(src).toMatch(/const on = selected === d\.label/);
    expect(src).toMatch(/fill = on \|\| i === best/);
  });

  it('makes the hour grid one instrument with a real cursor', () => {
    const src = read(`${DIR}/charts/Heatmap.tsx`);
    expect(src).toMatch(/tabIndex=\{0\}/);
    expect(src).toMatch(/ArrowDown/);
    expect(src).toMatch(/onPick\?: \(slot: Slot\) => void/);
    expect(src).toMatch(/aria-live="polite"/);
    // 168 cells must not become 168 tab stops.
    expect(src.match(/tabIndex/g)).toHaveLength(1);
  });

  it('lets the category ring act as the filter it describes', () => {
    const src = read(`${DIR}/charts/Donut.tsx`);
    expect(src).toMatch(/onPick\?: \(name: string\) => void/);
    expect(src).toMatch(/onClick=\{\(\) => onPick\?\.\(s\.d\.name\)\}/);
    expect(src).toMatch(/aria-pressed=\{active === d\.name\}/);
    expect(src).toMatch(/opacity=\{active && active !== s\.d\.name \? 0\.3 : 1\}/);
  });

  it('takes a category out of the multi-line plot from its own legend', () => {
    const src = read(`${DIR}/charts/MultiLine.tsx`);
    expect(src).toMatch(/setMuted/);
    expect(src).toMatch(/aria-pressed=\{!muted\.includes\(s\.name\)\}/);
    expect(src).toMatch(/onPointerEnter=\{\(\) => setActive\(i\)\}/);
  });

  it('draws an item’s own line for the drill-in', () => {
    const src = read(`${DIR}/charts/Sparkline.tsx`);
    expect(src).toMatch(/values: number\[\]/);
    expect(src).toMatch(/role="img"/);
    expect(src).toMatch(/aria-label=\{`\$\{label\}, day by day/);
  });
});

describe('the analytics screen wires them together', () => {
  const src = read(`${DIR}/AnalyticsView.tsx`);

  it('scopes the whole report to one category, bills rebuilt', () => {
    expect(src).toMatch(/scopeToCategory\(all, state\.menu, cat\)/);
    expect(src).toMatch(/<Donut[\s\S]*?active=\{cat\} onPick=/);
    expect(src).toMatch(/ob-chip/);
  });

  it('compares the window against the one before it', () => {
    expect(src).toMatch(/previousRange\(from, days\)/);
    expect(src).toMatch(/deltaPct\(data\.kpis\.revenue, data\.prevKpis\.revenue\)/);
    expect(src).toMatch(/ob-up/);
    expect(src).toMatch(/ob-down/);
  });

  it('opens the day, the hour and the item the reader points at', () => {
    expect(src).toMatch(/dayDetail\(data\.scoped, state\.menu, pinned\)/);
    expect(src).toMatch(/slotDetail\(data\.scoped, pickedSlot\.day, pickedSlot\.hour\)/);
    expect(src).toMatch(/itemSeries\(data\.scoped, drill, from, to\)/);
    expect(src).toMatch(/peakSlots\(data\.heat/);
    for (const open of ['detail &&', 'slotInfo && pickedSlot &&', 'drill && drillSeries && drillStats &&']) {
      expect(src, open).toContain(open);
    }
  });

  it('hands the report over as a file the owner can keep', () => {
    expect(src).toMatch(/reportCsv\(data\.byDay, state\.brand\.name/);
    expect(src).toMatch(/URL\.createObjectURL/);
    expect(src).toMatch(/a\.download = `orderbook-/);
    expect(src).toMatch(/setTimeout\(\(\) => URL\.revokeObjectURL\(url\)/);
  });

  it('never leaves a stale selection reading as a number', () => {
    // Selections are validated against the data on every render rather than
    // cleaned up in an effect, so changing range or scope cannot strand one.
    expect(src).toMatch(/const pinned = day && data\.byDay\.some\(\(d\) => d\.date === day\) \? day : null/);
    // An empty hour is a real answer, so the guard checks the cell exists rather
    // than whether it holds any bills.
    expect(src).toMatch(/const pickedSlot = slot && typeof data\.heat\[slot\.day\]\?\.\[slot\.hour\] === 'number' \? slot : null/);
    expect(src).toMatch(/slotInfo\.items\.length === 0/);
  });

  it('keeps every chart inside one scope of truth', () => {
    // The figures come from the same array, so the KPIs, the grid and the export
    // cannot disagree about what the week looked like.
    expect(src).toMatch(/scoped,\n\s+kpis: computeKpis\(scoped\)/);
    expect(src).toMatch(/hourlyHeatmap\(scoped\)/);
    expect(src).toMatch(/revenueByDay\(scoped, from, to\)/);
  });

  it('says what a flat ranking means instead of hiding it', () => {
    expect(src).toMatch(/Nothing sold in this scope\./);
    expect(src).toMatch(/Not sold once in this window/);
  });

  it('is a client screen with live regions on every readout', () => {
    expect(src.startsWith('// components/sites/analytical-register/AnalyticsView.tsx')).toBe(true);
    expect(src).toMatch(/^'use client';/m);
    const charts = ['Line', 'Heatmap', 'MultiLine', 'Donut']
      .map((c) => read(`${DIR}/charts/${c}.tsx`));
    for (const chart of charts) expect(chart).toMatch(/aria-live="polite"/);
  });
});

describe('the interactive styles', () => {
  const css = read('app/globals.css');
  const start = css.indexOf('OrderBook (analytical-register)');
  const block = () => css.slice(start, css.indexOf('Namesake (digital-portfolio)'));

  it('scopes every control class to the product', () => {
    for (const cls of [
      'ob-chip', 'ob-chip-on', 'ob-chart', 'ob-bar', 'ob-hit', 'ob-heat-on',
      'ob-row', 'ob-row-on', 'ob-caret', 'ob-drill', 'ob-drill-label', 'ob-drill-value',
      'ob-up', 'ob-down',
    ]) {
      expect(block(), cls).toContain(`.orderbook .${cls}`);
    }
  });

  it('gives the keyboard a visible ring wherever a chart takes focus', () => {
    const b = block();
    expect(b).toMatch(/\.orderbook \.ob-chart:focus-visible \{[^}]*outline: 2px solid var\(--ob-accent\)/s);
    expect(b).toMatch(/\.orderbook \.ob-bar:focus-visible \{[^}]*outline: 2px solid var\(--ob-accent\)/s);
  });

  it('settles every transition on these controls when motion is reduced', () => {
    const reduce = block().slice(block().lastIndexOf('@media (prefers-reduced-motion: reduce)'));
    for (const cls of ['ob-chip', 'ob-row', 'ob-caret', 'ob-counter']) {
      expect(reduce, cls).toContain(`.orderbook .${cls}`);
    }
  });

  it('tints the deltas and the chips with the accent, so a rebrand reaches them', () => {
    const b = block();
    expect(b).toMatch(/\.orderbook \.ob-chip-on \{[^}]*var\(--ob-accent\)/s);
    expect(b).toMatch(/\.orderbook \.ob-drill \{[^}]*var\(--ob-accent\)/s);
  });

  it('keeps a phone-sized report inside the screen', () => {
    // Grid items default to min-width: auto, which lets one wide chart label push
    // the whole page sideways; every card gives that up so the track stays put.
    expect(block()).toMatch(/\.orderbook \.ob-card \{[^}]*min-width: 0/s);
    // And a chip the reader taps has to be a thumb-sized target, not a text row.
    const phone = block().slice(block().indexOf('@media (max-width: 639px)', block().indexOf('.orderbook .ob-drill-value')));
    for (const cls of ['ob-chip', 'ob-btn', 'ob-btn-ghost']) {
      expect(phone, cls).toContain(`.orderbook .${cls}`);
    }
    expect(phone).toMatch(/min-height: 2\.75rem/);
  });
});
