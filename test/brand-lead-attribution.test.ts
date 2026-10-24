import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/lead/route';
import { leadChannelOf, leadChannels } from '@/content/brand/links';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

/** Every .tsx under a directory, recursively. */
function walk(rel: string): string[] {
  const abs = path.join(process.cwd(), rel);
  return readdirSync(abs).flatMap((name) => {
    const p = path.join(abs, name);
    if (statSync(p).isDirectory()) return walk(path.join(rel, name));
    return name.endsWith('.tsx') ? [path.join(rel, name).split(path.sep).join('/')] : [];
  });
}

const post = (body: string) =>
  POST(
    new Request('http://localhost/api/lead', {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' },
    }) as unknown as NextRequest,
  );

const tap = (placement: string, channel: string, pathname = '/services') =>
  post(JSON.stringify({ placement, channel, path: pathname }));

describe('lead attribution endpoint', () => {
  // The route logs for real; keep that out of the suite output unless a case
  // reads the lines back.
  beforeEach(() => vi.spyOn(console, 'info').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('records one structured line per valid tap', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const res = await tap('panel', 'whatsapp', '/about');

    expect(res.status).toBe(204);
    expect(info).toHaveBeenCalledTimes(1);
    const line = JSON.parse(info.mock.calls[0][0] as string);
    expect(line).toMatchObject({ lead: 1, placement: 'panel', channel: 'whatsapp', path: '/about' });
    expect(typeof line.at).toBe('string');
  });

  it('only takes the three channels it knows', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    for (const channel of [...leadChannels, 'sms', 'WHATSAPP', '']) {
      const res = await tap('panel', channel);
      const known = (leadChannels as readonly string[]).includes(channel);
      expect(res.status, channel).toBe(known ? 204 : 400);
    }
    expect(info).toHaveBeenCalledTimes(leadChannels.length);
  });

  it('rejects a placement that is not a plain id', async () => {
    for (const placement of [
      '',
      'Panel',
      'panel\nlead:9999',
      '-panel',
      'panel lead',
      'x'.repeat(33),
      '<script>alert(1)</script>',
    ]) {
      const res = await tap(placement, 'email');
      expect(res.status, JSON.stringify(placement)).toBe(400);
    }
  });

  it('rejects anything that is not a bare pathname', async () => {
    for (const pathname of [
      'services',
      '/services?utm=lead',
      '/services#main',
      '/services/',
      '//evil.com',
      '/a/b'.padEnd(140, 'x'),
      '',
    ]) {
      const res = await tap('panel', 'call', pathname);
      expect(res.status, JSON.stringify(pathname)).toBe(400);
    }
  });

  it('accepts the paths the brand pages actually serve', async () => {
    for (const pathname of ['/', '/services', '/portfolio/jainil5/work/teamsync']) {
      const res = await tap('panel', 'call', pathname);
      expect(res.status, pathname).toBe(204);
    }
  });

  it('refuses a body that is not an object', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    for (const body of ['', 'not json', 'null', '[1,2]', '"panel"', '{"placement":1}']) {
      const res = await post(body);
      expect(res.status, body).toBe(400);
    }
    expect(info).not.toHaveBeenCalled();
  });

  it('never writes a field it did not validate', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    await post(
      JSON.stringify({
        placement: 'panel',
        channel: 'email',
        path: '/services',
        href: 'https://wa.me/911234567890?text=secrets',
        visitor: 'someone@example.com',
      }),
    );

    expect(info).toHaveBeenCalledTimes(1);
    const logged = info.mock.calls[0][0] as string;
    expect(logged).not.toContain('secrets');
    expect(logged).not.toContain('someone@example.com');
    expect(Object.keys(JSON.parse(logged)).sort()).toEqual([
      'at',
      'channel',
      'lead',
      'path',
      'placement',
    ]);
  });
});

describe('channel is read from the href, not the label', () => {
  it('maps the three link schemes', () => {
    expect(leadChannelOf('https://wa.me/918238889347?text=hi')).toBe('whatsapp');
    expect(leadChannelOf('tel:+918238889347')).toBe('call');
    expect(leadChannelOf('mailto:mail.jainil5@gmail.com')).toBe('email');
  });

  it('declines every link that is not an enquiry', () => {
    for (const href of ['/contact', '#main', 'https://github.com/x/y', 'javascript:void(0)']) {
      expect(leadChannelOf(href), href).toBeNull();
    }
  });
});

describe('every enquiry control carries a placement', () => {
  const owned: Record<string, string[]> = {
    'components/brand/WhatsAppFab.tsx': ['data-cta="float"'],
    'components/brand/ContactCta.tsx': [
      'data-cta="hero"',
      'data-cta="hero-call"',
      'data-cta="panel"',
      'data-cta={`panel-${key}`}',
    ],
    'components/brand/SiteCompiler.tsx': ['data-cta="compiler"'],
    'components/brand/ProductFeature.tsx': ['data-cta="product"'],
    'components/Footer.tsx': ['data-cta={`footer-${key}`}'],
    'app/(site)/page.tsx': ['data-cta="home-enterprise"'],
    'app/(site)/enterprise/page.tsx': ['data-cta="enterprise"'],
    'app/(site)/contact/page.tsx': ['data-cta={`contact-${row.key}`}'],
  };

  it('labels the placement each enquiry anchor reports', () => {
    for (const [file, attrs] of Object.entries(owned)) {
      const src = read(file);
      for (const attr of attrs) {
        expect(src, `${file} -> ${attr}`).toContain(attr);
      }
    }
  });

  it('keeps placement ids unique across the brand chrome', () => {
    const files = ['components/brand', 'app/(site)'].flatMap(walk).concat('components/Footer.tsx');
    const attrs = files.flatMap(
      (rel) => read(rel).match(/data-cta=(?:"[^"]+"|\{`[^`]+`\})/g) ?? [],
    );
    expect(attrs.length).toBeGreaterThan(10);
    expect(new Set(attrs).size).toBe(attrs.length);
  });
});

describe('lead tracker', () => {
  const src = read('components/brand/LeadTracker.tsx');
  const layout = read('app/(site)/layout.tsx');

  it('rides the brand pages only', () => {
    expect(layout).toContain('<LeadTracker />');
    const mounted = walk('app')
      .filter((rel) => rel.endsWith('layout.tsx'))
      .filter((rel) => read(rel).includes('LeadTracker'));
    expect(mounted).toEqual(['app/(site)/layout.tsx']);
  });

  it('is one delegated listener, not a handler per link', () => {
    expect(src).toContain("addEventListener('click', onClick, true)");
    expect(src).toContain("closest<HTMLAnchorElement>('a[data-cta]')");
    expect(src).toContain("removeEventListener('click', onClick, true)");
    // Server components own the enquiry anchors, so they cannot carry handlers.
    expect(src).not.toMatch(/onClick=\{/);
  });

  it('sends the placement and nothing a visitor typed', () => {
    const payload = src.slice(src.indexOf('const body'), src.indexOf('navigator.sendBeacon'));
    expect(payload).toContain('link.dataset.cta');
    expect(payload).toContain('location.pathname');
    expect(payload).not.toContain('href');
    expect(src).toContain("sendBeacon('/api/lead'");
    expect(src).toContain('keepalive: true');
  });

  it('leaves no trace on the visitor machine', () => {
    expect(src).not.toMatch(/localStorage|sessionStorage|document\.cookie/);
  });
});
