# 📈 Investment Tracker

A mobile application for tracking stocks, ETFs, funds, bonds, and crypto — with AI-powered buy/sell recommendations powered by **Claude (claude-opus-4-6)**.

## Features

### Portfolio Tracking
- Track any stock, ETF, mutual fund, bond, or cryptocurrency
- Real-time price fetching via Yahoo Finance (no API key required)
- Record buy/sell transactions with quantity, price, and notes
- Automatic P&L calculation with average cost basis

### Technical Analysis
Computes 11 indicators on historical price data:
| Indicator | Description |
|---|---|
| **SMA(20/50)** | Simple Moving Average — trend direction |
| **EMA(12/26)** | Exponential Moving Average — faster-reacting trend |
| **RSI(14)** | Relative Strength Index — overbought/oversold |
| **MACD** | Momentum oscillator with signal/histogram |
| **Bollinger Bands** | Volatility envelope (upper/mid/lower) |
| **Volatility** | Annualized historical volatility |
| **Support/Resistance** | Key price levels from local extremes |
| **Volume** | Current vs 20-day average volume |
| **Price change** | 1D / 1W / 1M performance |

### AI-Powered Recommendations (Claude)
When you add an Anthropic API key, each analysis is powered by **Claude Opus 4.6** with adaptive thinking:
- **BUY / SELL / HOLD / STRONG_BUY / STRONG_SELL** recommendation
- Confidence score (0–100%)
- Target price and stop-loss levels
- Plain-English reasoning
- Key bullish/bearish factors
- Risk factors

Without an API key, the app falls back to a **rule-based analysis** engine using the same technical indicators.

## Screenshots

```
┌─────────────────────────────┐
│ 📈 Investments              │
│ Portfolio Value: $24,531.00 │
│ +$1,241 total P&L           │
│─────────────────────────────│
│ 📊 AAPL  Apple Inc.         │
│   250 shares · avg $182.40  │
│   $185.20  +1.5%  ●         │
│─────────────────────────────│
│ 📊 SPY   S&P 500 ETF        │
│   10 shares · avg $520.00   │
│   $528.10  +1.5%  ●         │
└─────────────────────────────┘
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npx expo start
```

Scan the QR code with the Expo Go app on your iOS/Android device.

### 3. Add API Keys (optional but recommended)

Go to **Settings** tab in the app:

| Key | Purpose | Get it at |
|---|---|---|
| **Anthropic API Key** | Claude AI recommendations | [console.anthropic.com](https://console.anthropic.com) |
| **Alpha Vantage API Key** | Backup market data | [alphavantage.co](https://www.alphavantage.co/support/#api-key) (free) |

The app works without any API keys using Yahoo Finance for prices and rule-based analysis.

## Architecture

```
src/
├── types/
│   └── index.ts              # All TypeScript interfaces
├── services/
│   ├── storageService.ts     # AsyncStorage CRUD (assets, transactions, portfolio, settings)
│   ├── stockService.ts       # Price fetching (Yahoo Finance, Alpha Vantage, mock fallback)
│   └── claudeService.ts      # Claude API analysis + rule-based fallback
├── utils/
│   ├── statistics.ts         # SMA, EMA, RSI, MACD, Bollinger, volatility, support/resistance
│   └── theme.ts              # Dark theme color palette
├── screens/
│   ├── PortfolioScreen.tsx   # Main watchlist + portfolio summary
│   ├── AssetDetailScreen.tsx # Chart + indicators + AI analysis + buy/sell
│   ├── AddAssetScreen.tsx    # Symbol search + add to watchlist
│   ├── AddTransactionScreen.tsx # Record buy/sell transaction
│   ├── TransactionsScreen.tsx   # Full transaction history
│   └── SettingsScreen.tsx    # API key management
└── components/
    ├── AssetCard.tsx               # Compact card for portfolio list
    ├── PriceChart.tsx              # Interactive line chart with timeframe selector
    ├── RecommendationCard.tsx      # AI/rule-based recommendation display
    ├── TechnicalIndicatorsPanel.tsx # Full indicator table with signals
    └── TransactionItem.tsx         # Single transaction row
```

## Data Sources

| Source | Usage | Key Required |
|---|---|---|
| Yahoo Finance | Primary price history & quotes | No |
| Alpha Vantage | Backup daily price history | Yes (free) |
| Built-in mock | Fallback for offline/demo | No |
| Claude Opus 4.6 | AI buy/sell analysis | Yes (Anthropic) |

## Claude API Integration

The analysis prompt sends Claude:
- Full technical indicator values
- 1-year price history summary (52w high/low, recent changes)
- Support and resistance levels
- Transaction history and current holding position
- Adaptive thinking enabled for deeper analysis

Claude responds with structured JSON that is parsed into a typed `AnalysisResult`. Analysis is cached for 1 hour to minimize API costs.

## Disclaimer

This app is for educational and informational purposes only. It does not constitute financial advice. Always consult a licensed financial advisor before making investment decisions.
