export interface ChartPoint {
  symbol: string;
  ok: boolean;
  price?: number;
  prevClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  week52High?: number;
  week52Low?: number;
  currency?: string;
  marketState?: string;
  timestamps?: number[];
  closes?: (number | null)[];
}

export interface Candle {
  t: number; // epoch seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface OhlcPayload {
  ok: boolean;
  symbol?: string;
  tf?: string;
  candles?: Candle[];
  prevClose?: number;
  currency?: string;
}

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  publishedAt: string; // ISO
  category: string;
  important: boolean;
}

export interface NewsPayload {
  mode: 'keyword' | 'llm';
  brief: string | null;
  items: NewsItem[];
}
