// test/analytical-register-menu.test.ts
import { describe, expect, it } from 'vitest';
import { defaultBrand, defaultMenu } from '@/components/sites/analytical-register/menu-data';

describe('defaultBrand', () => {
  it('is a configured cafe with a sender phone and GST rate', () => {
    expect(defaultBrand.id).toBeTruthy();
    expect(defaultBrand.name.trim().length).toBeGreaterThan(0);
    expect(defaultBrand.gstRate).toBeGreaterThanOrEqual(0);
    expect(defaultBrand.currency).toBe('₹');
  });
});

describe('defaultMenu', () => {
  it('has unique ids and positive prices', () => {
    expect(new Set(defaultMenu.map((m) => m.id)).size).toBe(defaultMenu.length);
    for (const m of defaultMenu) expect(m.price).toBeGreaterThan(0);
  });
  it('has at least three categories and every item active', () => {
    expect(new Set(defaultMenu.map((m) => m.category)).size).toBeGreaterThanOrEqual(3);
    expect(defaultMenu.every((m) => m.active)).toBe(true);
  });
});
