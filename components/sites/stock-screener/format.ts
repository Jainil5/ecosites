const inrGroup = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function inr(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return '—';
  return `₹${inrGroup.format(n)}`;
}

export function inrPlain(n: number | undefined | null, decimals = 2): string {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function pct(n: number | undefined | null, signed = true): string {
  if (n == null || Number.isNaN(n)) return '—';
  const s = n > 0 && signed ? '+' : '';
  return `${s}${n.toFixed(2)}%`;
}

// Indian compact notation: K / Lakh / Crore.
export function compact(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
  return String(Math.round(n));
}

// mcapCr is already in ₹ crore.
export function mcapLabel(mcapCr: number): string {
  if (mcapCr >= 1e5) return `₹${(mcapCr / 1e5).toFixed(2)} L Cr`;
  return `₹${inrGroup.format(Math.round(mcapCr))} Cr`;
}

export function changePct(price: number | undefined, prevClose: number | undefined): number | null {
  if (price == null || prevClose == null || prevClose === 0) return null;
  return ((price - prevClose) / prevClose) * 100;
}

export function agoLabel(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  if (Number.isNaN(diff)) return '—';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
