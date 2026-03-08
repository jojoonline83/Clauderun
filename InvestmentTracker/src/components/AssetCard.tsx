import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Asset, Portfolio } from '../types';
import { Colors, ASSET_TYPE_ICONS, RECOMMENDATION_COLORS } from '../utils/theme';

interface Props {
  asset: Asset;
  portfolio: Portfolio | null;
  currentPrice: number | null;
  recommendation?: string;
  onPress: () => void;
}

export default function AssetCard({ asset, portfolio, currentPrice, recommendation, onPress }: Props) {
  const holding = portfolio?.quantity ?? 0;
  const avgCost = portfolio?.avgCostBasis ?? 0;
  const marketValue = currentPrice !== null ? holding * currentPrice : null;
  const pnl = currentPrice !== null && holding > 0
    ? (currentPrice - avgCost) * holding
    : null;
  const pnlPct = avgCost > 0 && currentPrice !== null
    ? ((currentPrice - avgCost) / avgCost) * 100
    : null;

  const isPositive = pnl !== null ? pnl >= 0 : null;
  const recColor = recommendation ? RECOMMENDATION_COLORS[recommendation] : null;
  const icon = ASSET_TYPE_ICONS[asset.type] ?? '📈';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
          {holding > 0 && (
            <Text style={styles.holding}>{holding.toFixed(4)} units</Text>
          )}
        </View>
      </View>

      <View style={styles.right}>
        {currentPrice !== null && (
          <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
        )}
        {marketValue !== null && holding > 0 && (
          <Text style={styles.marketValue}>${marketValue.toFixed(2)}</Text>
        )}
        {pnl !== null && pnlPct !== null && (
          <Text style={[styles.pnl, { color: isPositive ? Colors.success : Colors.danger }]}>
            {isPositive ? '+' : ''}{pnlPct.toFixed(1)}%
          </Text>
        )}
        {recColor && (
          <View style={[styles.recDot, { backgroundColor: recColor }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  symbol: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  name: {
    color: Colors.textSecondary,
    fontSize: 12,
    maxWidth: 150,
  },
  holding: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  marketValue: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  pnl: {
    fontSize: 12,
    fontWeight: '600',
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
});
