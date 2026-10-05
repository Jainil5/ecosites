const PLACEHOLDER = /YOUR-PROJECT-REF|\bxxxxx\b/i;

export interface SavourEnv {
  url: string;
  key: string;
}

export function readSavourEnv(): SavourEnv | null {
  const url = (process.env.NEXT_PUBLIC_SAVOUR_SUPABASE_URL ?? '').trim();
  const key = (process.env.NEXT_PUBLIC_SAVOUR_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  if (!url || !key) return null;
  if (PLACEHOLDER.test(url)) return null;
  if (!/^https:\/\//.test(url)) return null;
  return { url, key };
}

export function isSavourConfigured(): boolean {
  return readSavourEnv() !== null;
}
