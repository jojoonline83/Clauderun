import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TechnicalIndicators } from '../types';
import { Colors } from '../utils/theme';

interface Props {
  indicators: TechnicalIndicators;
  currentPrice: number;
}

interface IndicatorRow {
  label: string;
  value: string | null;
  signal?: 'bullish' | 'bearish' | 'neutral';
}

function getRsiSignal(rsi: number): 'bullish' | 'bearish' | 'neutral' {
  if (rsi < 30) return 'bullish';
  if (rsi > 70) return 'bearish';
  return 'neutral';
}

function getPriceVsMASignal(price: number, ma: number): 'bullish' | 'bearish' {
  return price > ma ? 'bullish' : 'bearish';
}

function getMacdSignal(macd: number, signal: number): 'bullish' | 'bearish' {
  return macd > signal ? 'bullish' : 'bearish';
}

export default function TechnicalIndicatorsPanel({ indicators, currentPrice }: Props) {
  const rows: IndicatorRow[] = [
    {
      label: 'RSI (14)',
      value: indicators.rsi14 !== null ? indicators.rsi14.toFixed(1) : null,
      signal: indicators.rsi14 !== null ? getRsiSignal(indicators.rsi14) : undefined,
    },
    {
      label: 'SMA (20)',
      value: indicators.sma20 !== null ? `$${indicators.sma20}` : null,
      signal: indicators.sma20 !== null ? getPriceVsMASignal(currentPrice, indicators.sma20) : undefined,
    },
    {
      label: 'SMA (50)',
      value: indicators.sma50 !== null ? `$${indicators.sma50}` : null,
      signal: indicators.sma50 !== null ? getPriceVsMASignal(currentPrice, indicators.sma50) : undefined,
    },
    {
      label: 'EMA (12)',
      value: indicators.ema12 !== null ? `$${indicators.ema12}` : null,
      signal: indicators.ema12 !== null ? getPriceVsMASignal(currentPrice, indicators.ema12) : undefined,
    },
    {
      label: 'EMA (26)',
      value: indicators.ema26 !== null ? `$${indicators.ema26}` : null,
      signal: indicators.ema26 !== null ? getPriceVsMASignal(currentPrice, indicators.ema26) : undefined,
    },
    {
      label: 'MACD',
      value: indicators.macd !== null ? indicators.macd.toFixed(3) : null,
      signal: indicators.macd !== null && indicators.macdSignal !== null
        ? getMacdSignal(indicators.macd, indicators.macdSignal)
        : undefined,
    },
    {
      label: 'MACD Signal',
      value: indicators.macdSignal !== null ? indicators.macdSignal.toFixed(3) : null,
    },
    {
      label: 'BB Upper',
      value: indicators.bollingerUpper !== null ? `$${indicators.bollingerUpper}` : null,
      signal: indicators.bollingerUpper !== null
        ? currentPrice >= indicators.bollingerUpper ? 'bearish' : 'neutral'
        : undefined,
    },
    {
      label: 'BB Lower',
      value: indicators.bollingerLower !== null ? `$${indicators.bollingerLower}` : null,
      signal: indicators.bollingerLower !== null
        ? currentPrice <= indicators.bollingerLower ? 'bullish' : 'neutral'
        : undefined,
    },
    {
      label: 'Volatility',
      value: indicators.volatility !== null ? `${indicators.volatility}% p.a.` : null,
      signal: indicators.volatility !== null
        ? indicators.volatility > 40 ? 'bearish' : indicators.volatility < 20 ? 'bullish' : 'neutral'
        : undefined,
    },
    {
      label: 'Avg Volume (20D)',
      value: indicators.avgVolume20 !== null
        ? (indicators.avgVolume20 / 1_000_000).toFixed(2) + 'M'
        : null,
    },
  ];

  const signalColor = (signal?: 'bullish' | 'bearish' | 'neutral') => {
    if (signal === 'bullish') return Colors.success;
    if (signal === 'bearish') return Colors.danger;
    return Colors.textSecondary;
  };

  const signalIcon = (signal?: 'bullish' | 'bearish' | 'neutral') => {
    if (signal === 'bullish') return '▲';
    if (signal === 'bearish') return '▼';
    return '–';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Technical Indicators</Text>
      <View style={styles.grid}>
        {rows.filter(r => r.value !== null).map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>{row.value}</Text>
              {row.signal && (
                <Text style={[styles.signal, { color: signalColor(row.signal) }]}>
                  {signalIcon(row.signal)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Price changes */}
      <View style={styles.changesRow}>
        {indicators.priceChange1D !== null && (
          <View style={styles.changeItem}>
            <Text style={styles.changeLabel}>1D</Text>
            <Text style={[styles.changeValue, {
              color: indicators.priceChange1D >= 0 ? Colors.success : Colors.danger
            }]}>
              {indicators.priceChange1D >= 0 ? '+' : ''}{indicators.priceChange1D.toFixed(2)}%
            </Text>
          </View>
        )}
        {indicators.priceChange1W !== null && (
          <View style={styles.changeItem}>
            <Text style={styles.changeLabel}>1W</Text>
            <Text style={[styles.changeValue, {
              color: indicators.priceChange1W >= 0 ? Colors.success : Colors.danger
            }]}>
              {indicators.priceChange1W >= 0 ? '+' : ''}{indicators.priceChange1W.toFixed(2)}%
            </Text>
          </View>
        )}
        {indicators.priceChange1M !== null && (
          <View style={styles.changeItem}>
            <Text style={styles.changeLabel}>1M</Text>
            <Text style={[styles.changeValue, {
              color: indicators.priceChange1M >= 0 ? Colors.success : Colors.danger
            }]}>
              {indicators.priceChange1M >= 0 ? '+' : ''}{indicators.priceChange1M.toFixed(2)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  grid: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '66',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  signal: {
    fontSize: 10,
    fontWeight: '700',
    width: 12,
    textAlign: 'center',
  },
  changesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  changeItem: {
    alignItems: 'center',
  },
  changeLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
