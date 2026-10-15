'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle, ChartPoint } from './types';
import type { StockMeta } from './data';
import type { LiveTick } from './useLiveTicks';
import { useOhlc } from './useOhlc';
import { bollinger, emaSeries, rsiSeries, smaSeries } from './indicators';
import { changePct, compact, inr, pct } from './format';

// Shift epochs by IST offset so the chart's UTC axis labels read as IST times.
const IST = 19800;

const TFS = ['1D', '5D', '1M', '6M', '1Y'] as const;
type Tf = (typeof TFS)[number];

type IndicatorKey = 'sma20' | 'sma50' | 'ema20' | 'bb' | 'rsi';
const INDICATORS: { key: IndicatorKey; label: string; color: string }[] = [
  { key: 'sma20', label: 'SMA 20', color: '#F5A623' },
  { key: 'sma50', label: 'SMA 50', color: '#4DA3FF' },
  { key: 'ema20', label: 'EMA 20', color: '#B57BFF' },
  { key: 'bb', label: 'Bollinger', color: '#5B6B85' },
  { key: 'rsi', label: 'RSI 14', color: '#16C784' },
];

interface ChartPanelProps {
  meta: StockMeta;
  quote?: ChartPoint;
  live?: LiveTick;
  refreshKey?: number;
}

export function ChartPanel({ meta, quote, live, refreshKey }: ChartPanelProps) {
  const [tf, setTf] = useState<Tf>('1M');
  const [active, setActive] = useState<Set<IndicatorKey>>(() => new Set(['sma50', 'rsi']));
  const [hover, setHover] = useState<Candle | null>(null);
  const { data, loading, failed } = useOhlc(meta.symbol, tf, refreshKey);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const overlayRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const candlesRef = useRef<Candle[]>([]);

  const candles = data?.candles ?? [];
  const lastCandle = candles[candles.length - 1];
  const shown = hover ?? lastCandle ?? null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#0A0F1A' },
        textColor: '#8A98B0',
        fontSize: 11,
        panes: { separatorColor: '#1C2740', separatorHoverColor: '#2A3A57', enableResize: true },
      },
      grid: {
        vertLines: { color: '#0D1524' },
        horzLines: { color: '#0D1524' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#4DA3FF', labelBackgroundColor: '#4DA3FF' },
        horzLine: { color: '#4DA3FF', labelBackgroundColor: '#4DA3FF' },
      },
      rightPriceScale: { borderColor: '#1C2740' },
      timeScale: { borderColor: '#1C2740', timeVisible: true, secondsVisible: false, rightOffset: 4 },
    });
    chartRef.current = chart;

    candleRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#16C784',
      downColor: '#EA3943',
      wickUpColor: '#16C784',
      wickDownColor: '#EA3943',
      borderVisible: false,
      priceFormat: { type: 'price', precision: 2, minMove: 0.05 },
    });
    volumeRef.current = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    const onMove = (param: { time?: unknown; seriesData?: Map<unknown, unknown> }) => {
      const list = candlesRef.current;
      if (param.time == null || !list.length) return;
      const t = (param.time as number) - IST;
      const found = list.find((c) => c.t === t);
      if (found) setHover(found);
    };
    chart.subscribeCrosshairMove(onMove);

    return () => {
      chart.unsubscribeCrosshairMove(onMove);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      overlayRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleRef.current;
    const volumeSeries = volumeRef.current;
    if (!chart || !candleSeries || !volumeSeries) return;

    candlesRef.current = candles;
    candleSeries.setData(
      candles.map((c) => ({
        time: (c.t + IST) as UTCTimestamp,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      })),
    );
    volumeSeries.setData(
      candles.map((c) => ({
        time: (c.t + IST) as UTCTimestamp,
        value: c.v,
        color: c.c >= c.o ? 'rgba(22,199,132,0.35)' : 'rgba(234,57,67,0.35)',
      })),
    );
    if (candles.length) chart.timeScale().fitContent();

    // Rebuild indicator overlays for the current timeframe + toggles.
    for (const s of overlayRef.current.values()) chart.removeSeries(s);
    overlayRef.current.clear();

    const closes = candles.map((c) => c.c);
    const times = candles.map((c) => (c.t + IST) as UTCTimestamp);
    const addLine = (
      key: string,
      values: (number | null)[],
      color: string,
      pane = 0,
      dashed = false,
    ) => {
      const data = values
        .map((v, i) => (v == null ? null : { time: times[i], value: Math.round(v * 100) / 100 }))
        .filter((d): d is { time: UTCTimestamp; value: number } => d != null);
      if (!data.length) return;
      const series = chart.addSeries(
        LineSeries,
        { color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, lineStyle: dashed ? 2 : 0 },
        pane,
      );
      series.setData(data);
      overlayRef.current.set(key, series);
    };

    if (active.has('sma20')) addLine('sma20', smaSeries(closes, 20), '#F5A623');
    if (active.has('sma50')) addLine('sma50', smaSeries(closes, 50), '#4DA3FF');
    if (active.has('ema20')) addLine('ema20', emaSeries(closes, 20), '#B57BFF');
    if (active.has('bb')) {
      const bb = bollinger(closes, 20, 2);
      addLine('bbU', bb.upper, 'rgba(91,107,133,0.9)');
      addLine('bbM', bb.mid, 'rgba(91,107,133,0.55)', 0, true);
      addLine('bbL', bb.lower, 'rgba(91,107,133,0.9)');
    }
    if (active.has('rsi')) {
      addLine('rsi', rsiSeries(closes, 14), '#16C784', 1);
      const rsiPane = chart.panes()[1];
      if (rsiPane) rsiPane.setHeight(90);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, active]);

  const toggle = (key: IndicatorKey) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const price = live?.price ?? quote?.price;
  const change = changePct(price, quote?.prevClose);
  const up = change != null && change >= 0;
  const legend = useMemo(() => {
    if (!shown) return null;
    return (
      <span className="flex flex-wrap items-center gap-x-3 font-mono text-[10px] text-[#8A98B0]">
        <span>O <span className="text-[#E7EEF9]">{shown.o.toFixed(2)}</span></span>
        <span>H <span className="text-[#16C784]">{shown.h.toFixed(2)}</span></span>
        <span>L <span className="text-[#EA3943]">{shown.l.toFixed(2)}</span></span>
        <span>C <span className="text-[#E7EEF9]">{shown.c.toFixed(2)}</span></span>
        <span>Vol <span className="text-[#E7EEF9]">{compact(shown.v)}</span></span>
      </span>
    );
  }, [shown]);

  return (
    <section
      aria-label="Pro chart"
      className="mp-rise mp-scene mp-depth relative mb-5 overflow-hidden rounded-xl border border-[#1C2740] bg-[#0A0F1A]"
      style={{ '--d': '300ms' } as React.CSSProperties}
    >
      <span aria-hidden key={refreshKey ?? 'boot'} className="mp-sheen" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#131C2E] px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-mono text-sm text-[#E7EEF9]">{meta.symbol.replace('.NS', '')}</h2>
          <span className="font-mono text-[10px] text-[#5B6B85]">{meta.name}</span>
        </div>
        {price != null && (
          <div
            key={price}
            className={`flex items-baseline gap-2 rounded px-1 font-mono ${up ? 'mp-flash-up' : 'mp-flash-down'}`}
          >
            <span className={`text-sm ${up ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>{inr(price)}</span>
            <span className={`text-[11px] ${up ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>{pct(change)}</span>
            {live && live.dir !== 'flat' && (
              <span
                aria-label={live.dir === 'up' ? 'price ticking up' : 'price ticking down'}
                className={`text-[10px] ${live.dir === 'up' ? 'text-[#16C784]' : 'text-[#EA3943]'}`}
              >
                {live.dir === 'up' ? '▲' : '▼'}
              </span>
            )}
          </div>
        )}
        <div className="ml-auto flex gap-1" role="group" aria-label="Chart timeframe">
          {TFS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTf(t)}
              aria-pressed={tf === t}
              className={`focus-ring rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                tf === t
                  ? 'bg-[#16C784]/15 text-[#16C784]'
                  : 'text-[#5B6B85] hover:bg-[#131C2E] hover:text-[#E7EEF9]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        {INDICATORS.map((ind) => (
          <button
            key={ind.key}
            type="button"
            onClick={() => toggle(ind.key)}
            aria-pressed={active.has(ind.key)}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] transition-colors ${
              active.has(ind.key)
                ? 'border-[#2A3A57] bg-[#131C2E] text-[#E7EEF9]'
                : 'border-[#1C2740] text-[#5B6B85] hover:text-[#8A98B0]'
            }`}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: ind.color }} />
            {ind.label}
          </button>
        ))}
        <span className="ml-auto hidden sm:block">{legend}</span>
      </div>

      <div className="relative">
        <div ref={containerRef} className="h-[400px] w-full sm:h-[440px]" />
        {loading && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1A]/70 font-mono text-xs text-[#5B6B85]">
            Loading chart…
          </div>
        )}
        {!loading && (failed || candles.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1A]/80 font-mono text-xs text-[#5B6B85]">
            Chart data unavailable for {meta.symbol.replace('.NS', '')} on this timeframe.
          </div>
        )}
      </div>
    </section>
  );
}
