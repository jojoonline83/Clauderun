import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Asset, Portfolio, AnalysisResult } from '../types';
import { getAssets, getPortfolios, getCachedAnalysis, saveSettings, getSettings } from '../services/storageService';
import { fetchQuote } from '../services/stockService';
import AssetCard from '../components/AssetCard';
import { Colors } from '../utils/theme';

interface AssetWithData {
  asset: Asset;
  portfolio: Portfolio | null;
  currentPrice: number | null;
  recommendation?: string;
}

export default function PortfolioScreen({ navigation }: any) {
  const [items, setItems] = useState<AssetWithData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);

  const loadData = useCallback(async () => {
    const [assets, portfolios, settings] = await Promise.all([
      getAssets(),
      getPortfolios(),
      getSettings(),
    ]);

    setHasApiKey(!!settings.anthropicApiKey);

    // Fetch current prices and analysis in parallel
    const enriched = await Promise.all(
      assets.map(async (asset): Promise<AssetWithData> => {
        const portfolio = portfolios.find(p => p.assetId === asset.id) ?? null;
        const [quote, analysis] = await Promise.all([
          fetchQuote(asset.symbol),
          getCachedAnalysis(asset.id),
        ]);
        return {
          asset,
          portfolio,
          currentPrice: quote?.price ?? null,
          recommendation: analysis?.recommendation,
        };
      })
    );

    setItems(enriched);

    // Calculate totals
    let tv = 0;
    let totalCost = 0;
    for (const item of enriched) {
      if (item.portfolio && item.currentPrice && item.portfolio.quantity > 0) {
        tv += item.portfolio.quantity * item.currentPrice;
        totalCost += item.portfolio.totalInvested;
      }
    }
    setTotalValue(tv);
    setTotalPnl(tv - totalCost);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pnlPositive = totalPnl >= 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <FlatList
        data={items}
        keyExtractor={item => item.asset.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Portfolio summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Portfolio Value</Text>
              <Text style={styles.summaryValue}>
                ${totalValue.toFixed(2)}
              </Text>
              <Text style={[styles.summaryPnl, { color: pnlPositive ? Colors.success : Colors.danger }]}>
                {pnlPositive ? '+' : ''}${totalPnl.toFixed(2)} total P&L
              </Text>
            </View>

            {/* API key banner */}
            {!hasApiKey && (
              <TouchableOpacity
                style={styles.apiBanner}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={styles.apiBannerText}>
                  🤖 Add Anthropic API key to unlock AI-powered recommendations →
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Watchlist & Holdings</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AssetCard
            asset={item.asset}
            portfolio={item.portfolio}
            currentPrice={item.currentPrice}
            recommendation={item.recommendation}
            onPress={() => navigation.navigate('AssetDetail', { assetId: item.asset.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No assets tracked</Text>
            <Text style={styles.emptyText}>
              Tap + to add stocks, funds, bonds, or crypto to your watchlist
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAsset')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  summaryPnl: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  apiBanner: {
    backgroundColor: Colors.primaryDark + '33',
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  apiBannerText: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: Colors.background,
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 32,
  },
});
