import { PricePoint, TechnicalIndicators } from '../types';

// ─── Basic helpers ────────────────────────────────────────────────────────────

export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// ─── Moving Averages ─────────────────────────────────────────────────────────

export function sma(prices: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      result.push(mean(slice));
    }
  }
  return result;
}

export function ema(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let emaVal = prices[0];

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      emaVal = prices[0];
    } else {
      emaVal = prices[i] * k + emaVal * (1 - k);
    }
    result.push(i < period - 1 ? NaN : emaVal);
  }
  return result;
}

// ─── RSI ─────────────────────────────────────────────────────────────────────

export function rsi(prices: number[], period: number = 14): number[] {
  const result: number[] = new Array(prices.length).fill(NaN);
  if (prices.length < period + 1) return result;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  let avgGain = mean(gains);
  let avgLoss = mean(losses);

  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      const diff = prices[i] - prices[i - 1];
      avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[i] = 100 - 100 / (1 + rs);
  }

  return result;
}

// ─── MACD ─────────────────────────────────────────────────────────────────────

export function macd(
  prices: number[],
  fast: number = 12,
  slow: number = 26,
  signal: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = ema(prices, fast);
  const ema26 = ema(prices, slow);

  const macdLine = prices.map((_, i) => {
    if (isNaN(ema12[i]) || isNaN(ema26[i])) return NaN;
    return ema12[i] - ema26[i];
  });

  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalLine: number[] = new Array(macdLine.length).fill(NaN);
  const emaSignal = ema(validMacd, signal);

  let validIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (!isNaN(macdLine[i])) {
      if (validIdx < emaSignal.length && !isNaN(emaSignal[validIdx])) {
        signalLine[i] = emaSignal[validIdx];
      }
      validIdx++;
    }
  }

  const histogram = macdLine.map((m, i) => {
    if (isNaN(m) || isNaN(signalLine[i])) return NaN;
    return m - signalLine[i];
  });

  return { macd: macdLine, signal: signalLine, histogram };
}

// ─── Bollinger Bands ─────────────────────────────────────────────────────────

export function bollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number[]; mid: number[]; lower: number[] } {
  const mid = sma(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (isNaN(mid[i])) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(Math.max(0, i - period + 1), i + 1);
      const sd = stdDev(slice);
      upper.push(mid[i] + stdDevMultiplier * sd);
      lower.push(mid[i] - stdDevMultiplier * sd);
    }
  }

  return { upper, mid, lower };
}

// ─── Volatility ───────────────────────────────────────────────────────────────

export function annualizedVolatility(prices: number[], tradingDays: number = 252): number {
  if (prices.length < 2) return 0;
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  return stdDev(returns) * Math.sqrt(tradingDays) * 100;
}

// ─── Support / Resistance ─────────────────────────────────────────────────────

export interface SupportResistance {
  support: number[];
  resistance: number[];
}

export function findSupportResistance(prices: PricePoint[], lookback: number = 20): SupportResistance {
  const highs = prices.map(p => p.high);
  const lows = prices.map(p => p.low);
  const support: number[] = [];
  const resistance: number[] = [];

  for (let i = lookback; i < prices.length - lookback; i++) {
    const windowHighs = highs.slice(i - lookback, i + lookback);
    const windowLows = lows.slice(i - lookback, i + lookback);

    if (highs[i] === Math.max(...windowHighs)) {
      resistance.push(highs[i]);
    }
    if (lows[i] === Math.min(...windowLows)) {
      support.push(lows[i]);
    }
  }

  // Cluster nearby levels
  return {
    support: clusterLevels(support).slice(-3),
    resistance: clusterLevels(resistance).slice(-3),
  };
}

function clusterLevels(levels: number[], threshold: number = 0.02): number[] {
  if (levels.length === 0) return [];
  const sorted = [...levels].sort((a, b) => a - b);
  const clusters: number[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = clusters[clusters.length - 1];
    const prevMean = mean(prev);
    if (Math.abs(sorted[i] - prevMean) / prevMean < threshold) {
      prev.push(sorted[i]);
    } else {
      clusters.push([sorted[i]]);
    }
  }

  return clusters.map(c => mean(c));
}

// ─── Price change helpers ─────────────────────────────────────────────────────

export function priceChange(prices: PricePoint[], daysAgo: number): number | null {
  if (prices.length < 2) return null;
  const current = last(prices)!.close;
  const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  const past = prices.slice().reverse().find(p => p.timestamp <= cutoff);
  if (!past) return null;
  return ((current - past.close) / past.close) * 100;
}

// ─── Compute all indicators ───────────────────────────────────────────────────

export function computeIndicators(prices: PricePoint[]): TechnicalIndicators {
  if (prices.length < 5) {
    return {
      sma20: null, sma50: null, ema12: null, ema26: null,
      rsi14: null, macd: null, macdSignal: null, macdHistogram: null,
      bollingerUpper: null, bollingerLower: null, bollingerMid: null,
      volatility: null, avgVolume20: null, currentVolume: null,
      priceChange1D: null, priceChange1W: null, priceChange1M: null,
    };
  }

  const closes = prices.map(p => p.close);
  const volumes = prices.map(p => p.volume);

  const sma20Arr = sma(closes, 20);
  const sma50Arr = sma(closes, 50);
  const ema12Arr = ema(closes, 12);
  const ema26Arr = ema(closes, 26);
  const rsiArr = rsi(closes, 14);
  const macdData = macd(closes);
  const bbands = bollingerBands(closes, 20);

  const n = closes.length - 1;

  const vol20 = volumes.slice(Math.max(0, n - 19), n + 1);
  const avgVol20 = vol20.length > 0 ? mean(vol20) : null;

  return {
    sma20: isNaN(sma20Arr[n]) ? null : parseFloat(sma20Arr[n].toFixed(2)),
    sma50: isNaN(sma50Arr[n]) ? null : parseFloat(sma50Arr[n].toFixed(2)),
    ema12: isNaN(ema12Arr[n]) ? null : parseFloat(ema12Arr[n].toFixed(2)),
    ema26: isNaN(ema26Arr[n]) ? null : parseFloat(ema26Arr[n].toFixed(2)),
    rsi14: isNaN(rsiArr[n]) ? null : parseFloat(rsiArr[n].toFixed(1)),
    macd: isNaN(macdData.macd[n]) ? null : parseFloat(macdData.macd[n].toFixed(4)),
    macdSignal: isNaN(macdData.signal[n]) ? null : parseFloat(macdData.signal[n].toFixed(4)),
    macdHistogram: isNaN(macdData.histogram[n]) ? null : parseFloat(macdData.histogram[n].toFixed(4)),
    bollingerUpper: isNaN(bbands.upper[n]) ? null : parseFloat(bbands.upper[n].toFixed(2)),
    bollingerLower: isNaN(bbands.lower[n]) ? null : parseFloat(bbands.lower[n].toFixed(2)),
    bollingerMid: isNaN(bbands.mid[n]) ? null : parseFloat(bbands.mid[n].toFixed(2)),
    volatility: parseFloat(annualizedVolatility(closes).toFixed(1)),
    avgVolume20: avgVol20 ? Math.floor(avgVol20) : null,
    currentVolume: volumes[n] ?? null,
    priceChange1D: priceChange(prices, 1),
    priceChange1W: priceChange(prices, 7),
    priceChange1M: priceChange(prices, 30),
  };
}
