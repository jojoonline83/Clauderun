import { PricePoint, TimeFrame } from '../types';
import { getCachedPrices, savePriceCache } from './storageService';

// ─── Mock Data Generator ─────────────────────────────────────────────────────

function generateMockPrices(symbol: string, days: number): PricePoint[] {
  // Seed based on symbol so the same symbol always starts at the same price
  const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const basePrice = 50 + (hash % 950); // $50 - $1000

  const prices: PricePoint[] = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const dailyReturn = (Math.random() - 0.49) * 0.03; // slight upward bias
    price = Math.max(price * (1 + dailyReturn), 0.01);

    const dayVariance = price * 0.015;
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const high = price + Math.random() * dayVariance;
    const low = price - Math.random() * dayVariance;
    const close = price;
    const volume = Math.floor(1_000_000 + Math.random() * 5_000_000);

    prices.push({
      timestamp: now - i * 24 * 60 * 60 * 1000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(Math.min(low, open, close).toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  return prices;
}

// ─── Alpha Vantage Fetcher ───────────────────────────────────────────────────

async function fetchAlphaVantage(symbol: string, apiKey: string): Promise<PricePoint[] | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();

    const series = json['Time Series (Daily)'];
    if (!series) return null;

    const prices: PricePoint[] = Object.entries(series)
      .map(([dateStr, vals]: [string, any]) => ({
        timestamp: new Date(dateStr).getTime(),
        open: parseFloat(vals['1. open']),
        high: parseFloat(vals['2. high']),
        low: parseFloat(vals['3. low']),
        close: parseFloat(vals['5. adjusted close']),
        volume: parseInt(vals['6. volume'], 10),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return prices;
  } catch {
    return null;
  }
}

// ─── Yahoo Finance (unofficial) ──────────────────────────────────────────────

async function fetchYahooFinance(symbol: string, days: number): Promise<PricePoint[] | null> {
  try {
    const period2 = Math.floor(Date.now() / 1000);
    const period1 = period2 - days * 24 * 60 * 60;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!resp.ok) return null;

    const json = await resp.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const adjclose = result.indicators?.adjclose?.[0]?.adjclose || [];

    return timestamps.map((ts, i) => ({
      timestamp: ts * 1000,
      open: quote.open?.[i] ?? 0,
      high: quote.high?.[i] ?? 0,
      low: quote.low?.[i] ?? 0,
      close: adjclose[i] ?? quote.close?.[i] ?? 0,
      volume: quote.volume?.[i] ?? 0,
    })).filter(p => p.close > 0);
  } catch {
    return null;
  }
}

// ─── Quote fetcher (latest price) ───────────────────────────────────────────

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export async function fetchQuote(symbol: string, apiKey?: string): Promise<QuoteData | null> {
  // Try Yahoo Finance first (no API key needed)
  try {
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (resp.ok) {
      const json = await resp.json();
      const result = json?.chart?.result?.[0];
      const meta = result?.meta;
      if (meta?.regularMarketPrice) {
        return {
          symbol,
          price: meta.regularMarketPrice,
          change: meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose ?? 0),
          changePercent:
            ((meta.regularMarketPrice - (meta.chartPreviousClose ?? 0)) /
              (meta.chartPreviousClose ?? 1)) * 100,
          volume: meta.regularMarketVolume ?? 0,
        };
      }
    }
  } catch {}
  return null;
}

// ─── Main price fetcher ──────────────────────────────────────────────────────

const TIMEFRAME_DAYS: Record<TimeFrame, number> = {
  '1D': 5,   // need a few days for context
  '1W': 10,
  '1M': 35,
  '3M': 95,
  '6M': 185,
  '1Y': 370,
};

export async function fetchPriceHistory(
  symbol: string,
  timeFrame: TimeFrame,
  alphaVantageApiKey?: string
): Promise<PricePoint[]> {
  const cacheKey = `${symbol}_${timeFrame}`;
  const cached = await getCachedPrices(cacheKey);
  if (cached) return cached;

  const days = TIMEFRAME_DAYS[timeFrame];

  // Try Yahoo Finance (no key required)
  let prices = await fetchYahooFinance(symbol, days + 50); // extra history for indicators

  // Try Alpha Vantage if Yahoo fails and key is available
  if (!prices && alphaVantageApiKey) {
    prices = await fetchAlphaVantage(symbol, alphaVantageApiKey);
  }

  // Fall back to mock data
  if (!prices || prices.length === 0) {
    prices = generateMockPrices(symbol, days + 50);
  }

  // Trim to requested timeframe
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const trimmed = prices.filter(p => p.timestamp >= cutoff);
  const result = trimmed.length > 5 ? trimmed : prices.slice(-Math.min(days, prices.length));

  await savePriceCache(cacheKey, result);
  return result;
}

// ─── Full history for analysis (always 1Y+) ──────────────────────────────────

export async function fetchFullHistory(
  symbol: string,
  alphaVantageApiKey?: string
): Promise<PricePoint[]> {
  const cacheKey = `${symbol}_FULL`;
  const cached = await getCachedPrices(cacheKey);
  if (cached) return cached;

  let prices = await fetchYahooFinance(symbol, 400);

  if (!prices && alphaVantageApiKey) {
    prices = await fetchAlphaVantage(symbol, alphaVantageApiKey);
  }

  if (!prices || prices.length === 0) {
    prices = generateMockPrices(symbol, 400);
  }

  await savePriceCache(cacheKey, prices);
  return prices;
}

// ─── Symbol search ───────────────────────────────────────────────────────────

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

// Popular symbols for quick access when search API is unavailable
const POPULAR_SYMBOLS: SearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', exchange: 'NYSE' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', exchange: 'NYSE' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', type: 'bond', exchange: 'NYSE' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'bond', exchange: 'NYSE' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', type: 'crypto', exchange: 'CCC' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', type: 'crypto', exchange: 'CCC' },
];

export async function searchSymbols(query: string, apiKey?: string): Promise<SearchResult[]> {
  if (query.length < 1) return [];

  const q = query.toUpperCase();
  const local = POPULAR_SYMBOLS.filter(
    s => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
  ).slice(0, 10);

  if (local.length >= 3) return local;

  // Try Alpha Vantage search
  if (apiKey) {
    try {
      const resp = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`
      );
      if (resp.ok) {
        const json = await resp.json();
        const matches = (json.bestMatches ?? []).map((m: any) => ({
          symbol: m['1. symbol'],
          name: m['2. name'],
          type: m['3. type']?.toLowerCase() ?? 'stock',
          exchange: m['4. region'],
        }));
        return matches.slice(0, 10);
      }
    } catch {}
  }

  return local;
}
