import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { PricePoint, TechnicalIndicators, TimeFrame } from '../types';
import { Colors } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;

const TIMEFRAMES: TimeFrame[] = ['1W', '1M', '3M', '6M', '1Y'];

interface Props {
  prices: PricePoint[];
  indicators: TechnicalIndicators | null;
  selectedTimeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
}

interface ChartLayer {
  label: string;
  color: string;
  enabled: boolean;
}

export default function PriceChart({ prices, indicators, selectedTimeframe, onTimeframeChange }: Props) {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);

  if (prices.length < 3) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Not enough data to display chart</Text>
      </View>
    );
  }

  const closes = prices.map(p => p.close);
  const minClose = Math.min(...closes);
  const maxClose = Math.max(...closes);
  const currentClose = closes[closes.length - 1];
  const firstClose = closes[0];
  const isPositive = currentClose >= firstClose;

  // Generate labels - show ~5 labels
  const labelStep = Math.max(1, Math.floor(closes.length / 4));
  const labels = closes.map((_, i) => {
    if (i % labelStep === 0 || i === closes.length - 1) {
      const date = new Date(prices[i].timestamp);
      if (selectedTimeframe === '1W' || selectedTimeframe === '1M') {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      return `${date.getMonth() + 1}/${String(date.getFullYear()).slice(2)}`;
    }
    return '';
  });

  const chartColor = isPositive ? Colors.success : Colors.danger;

  const chartData = {
    labels,
    datasets: [
      {
        data: closes,
        color: () => chartColor,
        strokeWidth: 2,
      },
    ],
  };

  const priceChange = ((currentClose - firstClose) / firstClose) * 100;

  return (
    <View style={styles.container}>
      {/* Price header */}
      <View style={styles.priceHeader}>
        <Text style={styles.currentPrice}>${currentClose.toFixed(2)}</Text>
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? Colors.success + '22' : Colors.danger + '22' }]}>
          <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.danger }]}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Range */}
      <Text style={styles.rangeText}>
        Range: ${minClose.toFixed(2)} – ${maxClose.toFixed(2)}
      </Text>

      {/* Chart */}
      <LineChart
        data={chartData}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        chartConfig={{
          backgroundColor: Colors.surface,
          backgroundGradientFrom: Colors.surface,
          backgroundGradientTo: Colors.surface,
          decimalPlaces: 2,
          color: () => chartColor,
          labelColor: () => Colors.textSecondary,
          propsForDots: { r: '0' },
          propsForBackgroundLines: {
            stroke: Colors.border,
            strokeWidth: 0.5,
            strokeDasharray: '',
          },
          style: { borderRadius: 8 },
        }}
        bezier
        withDots={false}
        withInnerLines={true}
        withOuterLines={false}
        withShadow={false}
        style={styles.chart}
        formatYLabel={(val) => `$${parseFloat(val).toFixed(0)}`}
      />

      {/* Timeframe selector */}
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map(tf => (
          <TouchableOpacity
            key={tf}
            style={[
              styles.tfBtn,
              selectedTimeframe === tf && styles.tfBtnActive,
            ]}
            onPress={() => onTimeframeChange(tf)}
          >
            <Text style={[
              styles.tfText,
              selectedTimeframe === tf && styles.tfTextActive,
            ]}>
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Indicator toggles */}
      {indicators && (
        <View style={styles.indicatorRow}>
          <TouchableOpacity
            style={[styles.indBtn, showSMA20 && { borderColor: Colors.sma20, backgroundColor: Colors.sma20 + '22' }]}
            onPress={() => setShowSMA20(!showSMA20)}
          >
            <Text style={[styles.indText, showSMA20 && { color: Colors.sma20 }]}>
              SMA20 {indicators.sma20 ? `$${indicators.sma20}` : '--'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.indBtn, showSMA50 && { borderColor: Colors.sma50, backgroundColor: Colors.sma50 + '22' }]}
            onPress={() => setShowSMA50(!showSMA50)}
          >
            <Text style={[styles.indText, showSMA50 && { color: Colors.sma50 }]}>
              SMA50 {indicators.sma50 ? `$${indicators.sma50}` : '--'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  currentPrice: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rangeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -12,
  },
  timeframeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  tfBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tfBtnActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
  },
  tfText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tfTextActive: {
    color: Colors.primary,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  indBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  indText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
});
