export type AssetType = 'stock' | 'fund' | 'bond' | 'etf' | 'crypto';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  addedAt: number; // timestamp
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  assetSymbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  date: number; // timestamp
  notes?: string;
}

export interface Portfolio {
  assetId: string;
  quantity: number;
  avgCostBasis: number;
  totalInvested: number;
}

export interface TechnicalIndicators {
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  bollingerMid: number | null;
  volatility: number | null;
  avgVolume20: number | null;
  currentVolume: number | null;
  priceChange1D: number | null;
  priceChange1W: number | null;
  priceChange1M: number | null;
}

export type RecommendationType = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export interface AnalysisResult {
  assetId: string;
  symbol: string;
  recommendation: RecommendationType;
  confidence: number; // 0-100
  targetPrice: number | null;
  stopLoss: number | null;
  reasoning: string;
  keyFactors: string[];
  risks: string[];
  technicals: TechnicalIndicators;
  generatedAt: number;
}

export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface AppSettings {
  anthropicApiKey: string;
  alphaVantageApiKey: string;
  currency: string;
  theme: 'dark' | 'light';
}
