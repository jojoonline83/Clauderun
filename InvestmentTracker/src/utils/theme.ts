export const Colors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#21262D',
  border: '#30363D',
  primary: '#58A6FF',
  primaryDark: '#1F6FEB',
  success: '#3FB950',
  danger: '#F85149',
  warning: '#D29922',
  text: '#E6EDF3',
  textSecondary: '#8B949E',
  textMuted: '#484F58',
  strongBuy: '#26A65B',
  buy: '#3FB950',
  hold: '#D29922',
  sell: '#E5534B',
  strongSell: '#F85149',
  chartLine: '#58A6FF',
  chartFill: 'rgba(88, 166, 255, 0.15)',
  sma20: '#F0A500',
  sma50: '#9B59B6',
  bollingerBands: 'rgba(88, 166, 255, 0.3)',
};

export const RECOMMENDATION_COLORS: Record<string, string> = {
  STRONG_BUY: Colors.strongBuy,
  BUY: Colors.buy,
  HOLD: Colors.hold,
  SELL: Colors.sell,
  STRONG_SELL: Colors.strongSell,
};

export const RECOMMENDATION_LABELS: Record<string, string> = {
  STRONG_BUY: '⬆ Strong Buy',
  BUY: '↑ Buy',
  HOLD: '→ Hold',
  SELL: '↓ Sell',
  STRONG_SELL: '⬇ Strong Sell',
};

export const ASSET_TYPE_ICONS: Record<string, string> = {
  stock: '📈',
  fund: '💼',
  bond: '🏛',
  etf: '📊',
  crypto: '₿',
};
