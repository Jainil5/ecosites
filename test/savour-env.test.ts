import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSavourConfigured, readSavourEnv } from '@/components/sites/savour/env';

const URL = 'https://exujoxhylnyrvhmqqnhx.supabase.co';
const KEY = 'test-publishable-key';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SAVOUR_SUPABASE_URL', URL);
  vi.stubEnv('NEXT_PUBLIC_SAVOUR_SUPABASE_PUBLISHABLE_KEY', KEY);
});
afterEach(() => vi.unstubAllEnvs());

describe('readSavourEnv', () => {
  it('returns both values when configured', () => {
    expect(readSavourEnv()).toEqual({ url: URL, key: KEY });
  });
  it('returns null when the url is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SAVOUR_SUPABASE_URL', '');
    expect(readSavourEnv()).toBeNull();
    expect(isSavourConfigured()).toBe(false);
  });
  it('returns null when the key is blank', () => {
    vi.stubEnv('NEXT_PUBLIC_SAVOUR_SUPABASE_PUBLISHABLE_KEY', '   ');
    expect(readSavourEnv()).toBeNull();
  });
  it('rejects the placeholder host from the template', () => {
    vi.stubEnv('NEXT_PUBLIC_SAVOUR_SUPABASE_URL', 'https://YOUR-PROJECT-REF.supabase.co');
    expect(readSavourEnv()).toBeNull();
  });
  it('rejects a non-https url', () => {
    vi.stubEnv('NEXT_PUBLIC_SAVOUR_SUPABASE_URL', 'http://insecure.example.com');
    expect(readSavourEnv()).toBeNull();
  });
});
