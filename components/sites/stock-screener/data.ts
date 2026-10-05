export interface StockMeta {
  symbol: string; // Yahoo Finance symbol (NSE tickers use the .NS suffix)
  name: string;
  sector: string;
  mcapCr: number; // market cap in ₹ crore (static reference data)
  pe: number; // trailing P/E
  pb: number; // price-to-book
  eps: number; // EPS in ₹
  dy: number; // dividend yield %
}

export const STOCKS: StockMeta[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy', mcapCr: 1780000, pe: 26.8, pb: 2.4, eps: 89.2, dy: 0.34 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT', mcapCr: 1490000, pe: 28.4, pb: 11.2, eps: 118.5, dy: 1.65 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking', mcapCr: 1420000, pe: 18.2, pb: 2.8, eps: 102.3, dy: 1.12 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking', mcapCr: 940000, pe: 17.6, pb: 3.1, eps: 98.4, dy: 0.68 },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecom', mcapCr: 920000, pe: 62.1, pb: 8.9, eps: 32.6, dy: 0.42 },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT', mcapCr: 760000, pe: 24.6, pb: 7.8, eps: 84.9, dy: 2.05 },
  { symbol: 'ITC.NS', name: 'ITC', sector: 'FMCG', mcapCr: 585000, pe: 22.9, pb: 5.1, eps: 22.4, dy: 3.1 },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', sector: 'FMCG', mcapCr: 580000, pe: 42.3, pb: 9.6, eps: 54.2, dy: 1.75 },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', mcapCr: 830000, pe: 13.1, pb: 1.9, eps: 84.7, dy: 1.7 },
  { symbol: 'LT.NS', name: 'Larsen & Toubro', sector: 'Infra', mcapCr: 570000, pe: 32.7, pb: 4.6, eps: 129.4, dy: 0.62 },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank', sector: 'Banking', mcapCr: 365000, pe: 14.9, pb: 2.0, eps: 121.6, dy: 0.33 },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking', mcapCr: 355000, pe: 20.8, pb: 2.7, eps: 73.8, dy: 0.28 },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', sector: 'Consumer', mcapCr: 320000, pe: 52.4, pb: 10.3, eps: 64.1, dy: 1.35 },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', sector: 'Financial Services', mcapCr: 430000, pe: 33.9, pb: 5.8, eps: 141.8, dy: 0.55 },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', sector: 'Auto', mcapCr: 325000, pe: 26.2, pb: 4.2, eps: 322.5, dy: 1.12 },
  { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Consumer', mcapCr: 320000, pe: 88.6, pb: 17.4, eps: 82.7, dy: 0.12 },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', sector: 'Pharma', mcapCr: 460000, pe: 34.1, pb: 4.9, eps: 135.2, dy: 0.82 },
  { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'IT', mcapCr: 96000, pe: 18.4, pb: 2.6, eps: 51.3, dy: 2.3 },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', sector: 'Cement', mcapCr: 360000, pe: 42.8, pb: 3.9, eps: 296.4, dy: 0.55 },
  { symbol: 'ONGC.NS', name: 'ONGC', sector: 'Energy', mcapCr: 295000, pe: 7.4, pb: 1.2, eps: 82.6, dy: 4.8 },
  { symbol: 'NTPC.NS', name: 'NTPC', sector: 'Power', mcapCr: 350000, pe: 15.9, pb: 2.1, eps: 46.8, dy: 2.35 },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corp', sector: 'Power', mcapCr: 310000, pe: 16.8, pb: 3.4, eps: 48.2, dy: 2.9 },
  { symbol: 'TATAPOWER.NS', name: 'Tata Power', sector: 'Power', mcapCr: 135000, pe: 30.2, pb: 3.4, eps: 11.6, dy: 0.68 },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel', sector: 'Metals', mcapCr: 245000, pe: 58.7, pb: 1.3, eps: 12.9, dy: 1.95 },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies', sector: 'IT', mcapCr: 235000, pe: 24.9, pb: 5.2, eps: 137.6, dy: 2.9 },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', sector: 'Conglomerate', mcapCr: 285000, pe: 68.4, pb: 3.6, eps: 96.7, dy: 0.06 },
  { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ', sector: 'Infra', mcapCr: 300000, pe: 24.1, pb: 3.8, eps: 84.3, dy: 0.33 },
  { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto', sector: 'Auto', mcapCr: 260000, pe: 28.3, pb: 6.1, eps: 213.8, dy: 2.95 },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv', sector: 'Financial Services', mcapCr: 285000, pe: 36.2, pb: 4.4, eps: 106.9, dy: 0.18 },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra', sector: 'IT', mcapCr: 145000, pe: 32.6, pb: 4.3, eps: 89.7, dy: 1.3 },
  { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp', sector: 'Auto', mcapCr: 97000, pe: 18.7, pb: 3.5, eps: 208.4, dy: 3.6 },
  { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank', sector: 'Banking', mcapCr: 54000, pe: 9.4, pb: 0.9, eps: 176.2, dy: 1.05 },
  { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance', sector: 'Insurance', mcapCr: 330000, pe: 72.5, pb: 6.8, eps: 63.9, dy: 0.09 },
  { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance', sector: 'Insurance', mcapCr: 195000, pe: 68.9, pb: 5.4, eps: 37.2, dy: 0.0 },
  { symbol: 'M&M.NS', name: 'Mahindra & Mahindra', sector: 'Auto', mcapCr: 385000, pe: 25.4, pb: 4.7, eps: 152.6, dy: 0.95 },
  { symbol: 'DRREDDY.NS', name: 'Dr Reddy’s Labs', sector: 'Pharma', mcapCr: 105000, pe: 13.9, pb: 1.8, eps: 476.5, dy: 1.45 },
  { symbol: 'CIPLA.NS', name: 'Cipla', sector: 'Pharma', mcapCr: 130000, pe: 22.4, pb: 3.2, eps: 164.8, dy: 1.65 },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', sector: 'FMCG', mcapCr: 112000, pe: 68.2, pb: 4.9, eps: 26.4, dy: 0.65 },
  { symbol: 'DIVISLAB.NS', name: "Divi's Laboratories", sector: 'Pharma', mcapCr: 130000, pe: 54.6, pb: 7.1, eps: 128.9, dy: 0.55 },
  { symbol: 'BRITANNIA.NS', name: 'Britannia Industries', sector: 'FMCG', mcapCr: 128000, pe: 29.8, pb: 8.6, eps: 184.7, dy: 2.25 },
  { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', sector: 'Metals', mcapCr: 132000, pe: 13.2, pb: 1.4, eps: 65.3, dy: 1.4 },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel', sector: 'Metals', mcapCr: 118000, pe: 31.5, pb: 1.9, eps: 68.9, dy: 0.6 },
  { symbol: 'COALINDIA.NS', name: 'Coal India', sector: 'Mining', mcapCr: 225000, pe: 8.1, pb: 1.5, eps: 162.4, dy: 5.6 },
  { symbol: 'GAIL.NS', name: 'GAIL India', sector: 'Energy', mcapCr: 118000, pe: 12.4, pb: 1.2, eps: 42.7, dy: 3.2 },
  { symbol: 'GRASIM.NS', name: 'Grasim Industries', sector: 'Cement', mcapCr: 178000, pe: 24.7, pb: 1.8, eps: 154.2, dy: 0.8 },
  { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals', sector: 'Healthcare', mcapCr: 112000, pe: 88.3, pb: 9.2, eps: 145.8, dy: 0.12 },
  { symbol: 'NESTLEIND.NS', name: 'Nestlé India', sector: 'FMCG', mcapCr: 225000, pe: 72.1, pb: 12.8, eps: 129.6, dy: 1.5 },
  { symbol: 'PIDILITIND.NS', name: 'Pidilite Industries', sector: 'Chemicals', mcapCr: 102000, pe: 58.9, pb: 8.4, eps: 36.4, dy: 0.68 },
  { symbol: 'VEDL.NS', name: 'Vedanta', sector: 'Mining', mcapCr: 152000, pe: 15.6, pb: 2.7, eps: 38.9, dy: 2.1 },
  { symbol: 'ETERNAL.NS', name: 'Eternal (Zomato)', sector: 'E-commerce', mcapCr: 185000, pe: 292.4, pb: 8.9, eps: 5.1, dy: 0.0 },
  { symbol: 'TRENT.NS', name: 'Trent', sector: 'Retail', mcapCr: 248000, pe: 122.6, pb: 12.1, eps: 55.9, dy: 0.07 },
  { symbol: 'AWL.NS', name: 'Adani Wilmar', sector: 'FMCG', mcapCr: 92000, pe: 38.7, pb: 2.6, eps: 40.2, dy: 0.35 },
];

export const SECTORS = [...new Set(STOCKS.map((s) => s.sector))].sort();

export function capTier(mcapCr: number): 'mega' | 'large' | 'mid' {
  if (mcapCr >= 500000) return 'mega';
  if (mcapCr >= 150000) return 'large';
  return 'mid';
}
