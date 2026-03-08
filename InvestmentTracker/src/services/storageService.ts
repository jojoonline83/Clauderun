import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset, Transaction, Portfolio, AnalysisResult, AppSettings } from '../types';

const KEYS = {
  ASSETS: '@investment_tracker/assets',
  TRANSACTIONS: '@investment_tracker/transactions',
  PORTFOLIOS: '@investment_tracker/portfolios',
  ANALYSIS: '@investment_tracker/analysis',
  SETTINGS: '@investment_tracker/settings',
  PRICE_CACHE: '@investment_tracker/price_cache',
};

// ─── Assets ────────────────────────────────────────────────────────────────

export async function getAssets(): Promise<Asset[]> {
  const data = await AsyncStorage.getItem(KEYS.ASSETS);
  return data ? JSON.parse(data) : [];
}

export async function saveAsset(asset: Asset): Promise<void> {
  const assets = await getAssets();
  const idx = assets.findIndex(a => a.id === asset.id);
  if (idx >= 0) {
    assets[idx] = asset;
  } else {
    assets.push(asset);
  }
  await AsyncStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
}

export async function deleteAsset(assetId: string): Promise<void> {
  const assets = await getAssets();
  await AsyncStorage.setItem(
    KEYS.ASSETS,
    JSON.stringify(assets.filter(a => a.id !== assetId))
  );
}

// ─── Transactions ───────────────────────────────────────────────────────────

export async function getTransactions(assetId?: string): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  const all: Transaction[] = data ? JSON.parse(data) : [];
  return assetId ? all.filter(t => t.assetId === assetId) : all;
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const txs = await getTransactions();
  txs.push(tx);
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
  await recalculatePortfolio(tx.assetId);
}

export async function deleteTransaction(txId: string): Promise<void> {
  const txs = await getTransactions();
  const removed = txs.find(t => t.id === txId);
  await AsyncStorage.setItem(
    KEYS.TRANSACTIONS,
    JSON.stringify(txs.filter(t => t.id !== txId))
  );
  if (removed) {
    await recalculatePortfolio(removed.assetId);
  }
}

// ─── Portfolio ──────────────────────────────────────────────────────────────

async function recalculatePortfolio(assetId: string): Promise<void> {
  const txs = await getTransactions(assetId);
  let qty = 0;
  let totalCost = 0;

  for (const tx of txs) {
    if (tx.type === 'buy') {
      totalCost += tx.totalValue;
      qty += tx.quantity;
    } else {
      const costPerUnit = qty > 0 ? totalCost / qty : 0;
      totalCost -= costPerUnit * tx.quantity;
      qty -= tx.quantity;
    }
  }

  const portfolios = await getPortfolios();
  const idx = portfolios.findIndex(p => p.assetId === assetId);
  const updated: Portfolio = {
    assetId,
    quantity: Math.max(0, qty),
    avgCostBasis: qty > 0 ? totalCost / qty : 0,
    totalInvested: Math.max(0, totalCost),
  };

  if (idx >= 0) {
    portfolios[idx] = updated;
  } else {
    portfolios.push(updated);
  }

  await AsyncStorage.setItem(KEYS.PORTFOLIOS, JSON.stringify(portfolios));
}

export async function getPortfolios(): Promise<Portfolio[]> {
  const data = await AsyncStorage.getItem(KEYS.PORTFOLIOS);
  return data ? JSON.parse(data) : [];
}

export async function getPortfolio(assetId: string): Promise<Portfolio | null> {
  const portfolios = await getPortfolios();
  return portfolios.find(p => p.assetId === assetId) ?? null;
}

// ─── Analysis Cache ──────────────────────────────────────────────────────────

export async function getCachedAnalysis(assetId: string): Promise<AnalysisResult | null> {
  const data = await AsyncStorage.getItem(KEYS.ANALYSIS);
  const all: Record<string, AnalysisResult> = data ? JSON.parse(data) : {};
  const result = all[assetId];
  if (!result) return null;
  // Cache valid for 1 hour
  if (Date.now() - result.generatedAt > 60 * 60 * 1000) return null;
  return result;
}

export async function saveAnalysis(result: AnalysisResult): Promise<void> {
  const data = await AsyncStorage.getItem(KEYS.ANALYSIS);
  const all: Record<string, AnalysisResult> = data ? JSON.parse(data) : {};
  all[result.assetId] = result;
  await AsyncStorage.setItem(KEYS.ANALYSIS, JSON.stringify(all));
}

// ─── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  alphaVantageApiKey: '',
  currency: 'USD',
  theme: 'dark',
};

export async function getSettings(): Promise<AppSettings> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
}

// ─── Price Cache ─────────────────────────────────────────────────────────────

interface PriceCacheEntry {
  symbol: string;
  data: any;
  fetchedAt: number;
}

export async function getCachedPrices(symbol: string): Promise<any | null> {
  const data = await AsyncStorage.getItem(KEYS.PRICE_CACHE);
  const cache: Record<string, PriceCacheEntry> = data ? JSON.parse(data) : {};
  const entry = cache[symbol];
  if (!entry) return null;
  // Cache valid for 15 minutes for intraday, 24h for EOD
  if (Date.now() - entry.fetchedAt > 15 * 60 * 1000) return null;
  return entry.data;
}

export async function savePriceCache(symbol: string, priceData: any): Promise<void> {
  const data = await AsyncStorage.getItem(KEYS.PRICE_CACHE);
  const cache: Record<string, PriceCacheEntry> = data ? JSON.parse(data) : {};
  cache[symbol] = { symbol, data: priceData, fetchedAt: Date.now() };
  await AsyncStorage.setItem(KEYS.PRICE_CACHE, JSON.stringify(cache));
}
