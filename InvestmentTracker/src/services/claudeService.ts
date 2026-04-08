import Anthropic from '@anthropic-ai/sdk';
import { Asset, PricePoint, TechnicalIndicators, AnalysisResult, RecommendationType, Transaction } from '../types';
import { computeIndicators, findSupportResistance, last } from '../utils/statistics';
import { getCachedAnalysis, saveAnalysis } from './storageService';

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildAnalysisPrompt(
  asset: Asset,
  prices: PricePoint[],
  indicators: TechnicalIndicators,
  transactions: Transaction[],
  portfolio: { quantity: number; avgCostBasis: number } | null
): string {
  const currentPrice = last(prices)?.close ?? 0;
  const sr = findSupportResistance(prices);

  const txSummary = transactions.length === 0
    ? 'No transactions recorded.'
    : transactions.slice(-10).map(t =>
        `${t.type.toUpperCase()} ${t.quantity} @ $${t.price.toFixed(2)} on ${new Date(t.date).toLocaleDateString()}`
      ).join('\n');

  const holdingInfo = portfolio && portfolio.quantity > 0
    ? `Current holding: ${portfolio.quantity} units @ avg cost $${portfolio.avgCostBasis.toFixed(2)} (P&L: ${((currentPrice - portfolio.avgCostBasis) / portfolio.avgCostBasis * 100).toFixed(1)}%)`
    : 'No current holding (potential entry)';

  return `You are an expert quantitative financial analyst. Analyze the following asset and provide a clear trading recommendation.

## Asset Information
- Symbol: ${asset.symbol}
- Name: ${asset.name}
- Type: ${asset.type.toUpperCase()}
- Currency: ${asset.currency}
- Current Price: $${currentPrice.toFixed(2)}
- ${holdingInfo}

## Price History Summary
- Data points: ${prices.length} trading days
- 52-week high: $${Math.max(...prices.map(p => p.high)).toFixed(2)}
- 52-week low: $${Math.min(...prices.map(p => p.low)).toFixed(2)}
- Price change 1D: ${indicators.priceChange1D !== null ? indicators.priceChange1D.toFixed(2) + '%' : 'N/A'}
- Price change 1W: ${indicators.priceChange1W !== null ? indicators.priceChange1W.toFixed(2) + '%' : 'N/A'}
- Price change 1M: ${indicators.priceChange1M !== null ? indicators.priceChange1M.toFixed(2) + '%' : 'N/A'}

## Technical Indicators
- SMA(20): ${indicators.sma20 !== null ? '$' + indicators.sma20 : 'N/A'}
- SMA(50): ${indicators.sma50 !== null ? '$' + indicators.sma50 : 'N/A'}
- EMA(12): ${indicators.ema12 !== null ? '$' + indicators.ema12 : 'N/A'}
- EMA(26): ${indicators.ema26 !== null ? '$' + indicators.ema26 : 'N/A'}
- RSI(14): ${indicators.rsi14 !== null ? indicators.rsi14 : 'N/A'}
- MACD: ${indicators.macd !== null ? indicators.macd : 'N/A'}
- MACD Signal: ${indicators.macdSignal !== null ? indicators.macdSignal : 'N/A'}
- MACD Histogram: ${indicators.macdHistogram !== null ? indicators.macdHistogram : 'N/A'}
- Bollinger Upper: ${indicators.bollingerUpper !== null ? '$' + indicators.bollingerUpper : 'N/A'}
- Bollinger Mid: ${indicators.bollingerMid !== null ? '$' + indicators.bollingerMid : 'N/A'}
- Bollinger Lower: ${indicators.bollingerLower !== null ? '$' + indicators.bollingerLower : 'N/A'}
- Annualized Volatility: ${indicators.volatility !== null ? indicators.volatility + '%' : 'N/A'}
- Avg Volume (20D): ${indicators.avgVolume20 !== null ? indicators.avgVolume20.toLocaleString() : 'N/A'}
- Current Volume: ${indicators.currentVolume !== null ? indicators.currentVolume.toLocaleString() : 'N/A'}

## Key Price Levels
- Support levels: ${sr.support.map(s => '$' + s.toFixed(2)).join(', ') || 'None identified'}
- Resistance levels: ${sr.resistance.map(r => '$' + r.toFixed(2)).join(', ') || 'None identified'}

## Transaction History (last 10)
${txSummary}

## Analysis Instructions
Based on all the above data, provide a comprehensive analysis. You MUST respond with ONLY valid JSON in this exact structure:

{
  "recommendation": "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL",
  "confidence": <integer 0-100>,
  "targetPrice": <number or null>,
  "stopLoss": <number or null>,
  "reasoning": "<2-4 sentence summary explaining the recommendation>",
  "keyFactors": ["<factor 1>", "<factor 2>", "<factor 3>", ...],
  "risks": ["<risk 1>", "<risk 2>", "<risk 3>", ...]
}

Rules:
- recommendation: Based on technical signals, trend, momentum, and risk/reward
- confidence: How confident you are (70+ = strong signal, 50-70 = moderate, <50 = weak)
- targetPrice: Realistic near-term price target (next 1-3 months), or null if unclear
- stopLoss: Suggested stop-loss level to manage risk, or null if unclear
- reasoning: Clear, actionable summary suitable for retail investors
- keyFactors: 3-5 most important bullish/bearish factors driving the recommendation
- risks: 2-4 key risks to the recommendation

Consider: trend direction, momentum (RSI, MACD), volatility, volume confirmation, price vs moving averages, Bollinger band position, support/resistance levels, and the investor's current position.`;
}

// ─── Response parser ─────────────────────────────────────────────────────────

function parseAnalysisResponse(
  text: string,
  asset: Asset,
  indicators: TechnicalIndicators
): AnalysisResult {
  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');

  const parsed = JSON.parse(jsonMatch[0]);

  const validRecommendations: RecommendationType[] = [
    'STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'
  ];
  const recommendation = validRecommendations.includes(parsed.recommendation)
    ? parsed.recommendation as RecommendationType
    : 'HOLD';

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    recommendation,
    confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence, 10) || 50)),
    targetPrice: typeof parsed.targetPrice === 'number' ? parsed.targetPrice : null,
    stopLoss: typeof parsed.stopLoss === 'number' ? parsed.stopLoss : null,
    reasoning: parsed.reasoning || 'Analysis completed.',
    keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors.slice(0, 6) : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 5) : [],
    technicals: indicators,
    generatedAt: Date.now(),
  };
}

// ─── Rule-based fallback ─────────────────────────────────────────────────────

function ruleBasedAnalysis(
  asset: Asset,
  indicators: TechnicalIndicators,
  currentPrice: number
): AnalysisResult {
  const signals: number[] = [];
  const factors: string[] = [];
  const risks: string[] = [];

  // RSI signal
  if (indicators.rsi14 !== null) {
    if (indicators.rsi14 < 30) {
      signals.push(2);
      factors.push(`RSI at ${indicators.rsi14} indicates oversold conditions`);
    } else if (indicators.rsi14 > 70) {
      signals.push(-2);
      factors.push(`RSI at ${indicators.rsi14} indicates overbought conditions`);
      risks.push('Overbought momentum may lead to short-term pullback');
    } else if (indicators.rsi14 > 50) {
      signals.push(1);
      factors.push(`RSI at ${indicators.rsi14} shows bullish momentum`);
    } else {
      signals.push(-1);
      factors.push(`RSI at ${indicators.rsi14} shows bearish momentum`);
    }
  }

  // SMA crossover
  if (indicators.sma20 !== null && indicators.sma50 !== null) {
    if (indicators.sma20 > indicators.sma50) {
      signals.push(1);
      factors.push('Golden cross: SMA20 above SMA50 (bullish trend)');
    } else {
      signals.push(-1);
      factors.push('Death cross: SMA20 below SMA50 (bearish trend)');
    }
  }

  // Price vs SMA20
  if (indicators.sma20 !== null) {
    if (currentPrice > indicators.sma20) {
      signals.push(1);
      factors.push('Price trading above 20-day moving average');
    } else {
      signals.push(-1);
      factors.push('Price trading below 20-day moving average');
      risks.push('Price below key moving average suggests downtrend');
    }
  }

  // MACD
  if (indicators.macd !== null && indicators.macdSignal !== null) {
    if (indicators.macd > indicators.macdSignal) {
      signals.push(1);
      factors.push('MACD line above signal line (bullish crossover)');
    } else {
      signals.push(-1);
      factors.push('MACD line below signal line (bearish crossover)');
    }
  }

  // Bollinger Bands
  if (indicators.bollingerLower !== null && indicators.bollingerUpper !== null) {
    if (currentPrice <= indicators.bollingerLower) {
      signals.push(2);
      factors.push('Price at lower Bollinger Band (potential reversal zone)');
    } else if (currentPrice >= indicators.bollingerUpper) {
      signals.push(-1);
      factors.push('Price at upper Bollinger Band (potential overbought)');
      risks.push('Trading near upper band may see mean reversion');
    }
  }

  // Volume
  if (indicators.currentVolume !== null && indicators.avgVolume20 !== null) {
    if (indicators.currentVolume > indicators.avgVolume20 * 1.5) {
      factors.push('Above-average volume confirms price movement');
    }
  }

  // Volatility risk
  if (indicators.volatility !== null && indicators.volatility > 40) {
    risks.push(`High annualized volatility (${indicators.volatility}%) increases position risk`);
  }

  if (risks.length === 0) {
    risks.push('Market conditions can change rapidly; always use stop-losses');
    risks.push('Past technical patterns do not guarantee future performance');
  }

  const score = signals.reduce((s, v) => s + v, 0);
  const maxScore = signals.length * 2;
  const normalized = maxScore > 0 ? score / maxScore : 0;

  let recommendation: RecommendationType;
  let confidence: number;

  if (normalized >= 0.6) { recommendation = 'STRONG_BUY'; confidence = 75 + Math.round(normalized * 20); }
  else if (normalized >= 0.3) { recommendation = 'BUY'; confidence = 60 + Math.round(normalized * 20); }
  else if (normalized >= -0.3) { recommendation = 'HOLD'; confidence = 55; }
  else if (normalized >= -0.6) { recommendation = 'SELL'; confidence = 60 + Math.round(Math.abs(normalized) * 20); }
  else { recommendation = 'STRONG_SELL'; confidence = 75 + Math.round(Math.abs(normalized) * 20); }

  const targetPrice = recommendation.includes('BUY') && indicators.bollingerUpper
    ? indicators.bollingerUpper
    : recommendation.includes('SELL') && indicators.bollingerLower
    ? indicators.bollingerLower
    : null;

  const stopLoss = recommendation.includes('BUY') && indicators.bollingerLower
    ? indicators.bollingerLower
    : null;

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    recommendation,
    confidence: Math.min(90, confidence),
    targetPrice,
    stopLoss,
    reasoning: `Rule-based technical analysis suggests ${recommendation.replace('_', ' ')}. `
      + `Score: ${score}/${maxScore}. ${factors[0] ?? 'Multiple indicators analyzed.'}`,
    keyFactors: factors.slice(0, 5),
    risks: risks.slice(0, 4),
    technicals: indicators,
    generatedAt: Date.now(),
  };
}

// ─── Main analysis function ───────────────────────────────────────────────────

export async function analyzeAsset(
  asset: Asset,
  prices: PricePoint[],
  transactions: Transaction[],
  portfolio: { quantity: number; avgCostBasis: number } | null,
  apiKey: string,
  forceRefresh: boolean = false
): Promise<AnalysisResult> {
  // Check cache first
  if (!forceRefresh) {
    const cached = await getCachedAnalysis(asset.id);
    if (cached) return cached;
  }

  const indicators = computeIndicators(prices);
  const currentPrice = last(prices)?.close ?? 0;

  // Use Claude if API key is provided
  if (apiKey && apiKey.trim().startsWith('sk-ant-')) {
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const prompt = buildAnalysisPrompt(asset, prices, indicators, transactions, portfolio);

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const textBlock = response.content.find(b => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('No text response');

      const result = parseAnalysisResponse(textBlock.text, asset, indicators);
      await saveAnalysis(result);
      return result;
    } catch (err) {
      console.warn('Claude API failed, falling back to rule-based analysis:', err);
    }
  }

  // Fallback: rule-based analysis
  const result = ruleBasedAnalysis(asset, indicators, currentPrice);
  await saveAnalysis(result);
  return result;
}
