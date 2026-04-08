import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Asset, PricePoint, TechnicalIndicators, AnalysisResult, TimeFrame, Transaction, Portfolio } from '../types';
import {
  getAssets, getTransactions, getPortfolio, getSettings, deleteAsset
} from '../services/storageService';
import { fetchPriceHistory, fetchFullHistory } from '../services/stockService';
import { analyzeAsset } from '../services/claudeService';
import { computeIndicators, last } from '../utils/statistics';
import PriceChart from '../components/PriceChart';
import TechnicalIndicatorsPanel from '../components/TechnicalIndicatorsPanel';
import RecommendationCard from '../components/RecommendationCard';
import TransactionItem from '../components/TransactionItem';
import { Colors, ASSET_TYPE_ICONS, RECOMMENDATION_COLORS } from '../utils/theme';
import { deleteTransaction } from '../services/storageService';

export default function AssetDetailScreen({ route, navigation }: any) {
  const { assetId } = route.params;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [allPrices, setAllPrices] = useState<PricePoint[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  const loadData = useCallback(async (tf: TimeFrame = timeFrame, force = false) => {
    const assets = await getAssets();
    const found = assets.find(a => a.id === assetId);
    if (!found) {
      navigation.goBack();
      return;
    }
    setAsset(found);

    const [settings, txs, port] = await Promise.all([
      getSettings(),
      getTransactions(assetId),
      getPortfolio(assetId),
    ]);

    setTransactions(txs);
    setPortfolio(port);

    // Fetch price data
    const [tfPrices, fullPrices] = await Promise.all([
      fetchPriceHistory(found.symbol, tf, settings.alphaVantageApiKey),
      fetchFullHistory(found.symbol, settings.alphaVantageApiKey),
    ]);

    setPrices(tfPrices);
    setAllPrices(fullPrices);

    // Compute indicators on full price history for accuracy
    const inds = computeIndicators(fullPrices.length > 50 ? fullPrices : tfPrices);
    setIndicators(inds);

    setLoading(false);
  }, [assetId, timeFrame]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const handleTimeframeChange = async (tf: TimeFrame) => {
    setTimeFrame(tf);
    const assets = await getAssets();
    const found = assets.find(a => a.id === assetId);
    if (!found) return;
    const settings = await getSettings();
    const tfPrices = await fetchPriceHistory(found.symbol, tf, settings.alphaVantageApiKey);
    setPrices(tfPrices);
  };

  const handleAnalyze = async () => {
    if (!asset) return;
    setAnalyzing(true);
    try {
      const settings = await getSettings();
      if (!settings.anthropicApiKey) {
        Alert.alert(
          'API Key Required',
          'Please add your Anthropic API key in Settings to use AI analysis.',
          [
            { text: 'Cancel' },
            { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
          ]
        );
        setAnalyzing(false);
        return;
      }
      const pricesToUse = allPrices.length > 50 ? allPrices : prices;
      const result = await analyzeAsset(
        asset,
        pricesToUse,
        transactions,
        portfolio,
        settings.anthropicApiKey,
        true
      );
      setAnalysis(result);
    } catch (err) {
      Alert.alert('Analysis Failed', String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickAnalyze = async () => {
    if (!asset) return;
    setAnalyzing(true);
    try {
      const settings = await getSettings();
      const pricesToUse = allPrices.length > 50 ? allPrices : prices;
      // Use rule-based (no API key needed)
      const result = await analyzeAsset(
        asset,
        pricesToUse,
        transactions,
        portfolio,
        '', // empty key forces rule-based
        true
      );
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteAsset = () => {
    Alert.alert(
      'Remove Asset',
      `Remove ${asset?.symbol} from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (asset) {
              await deleteAsset(asset.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleDeleteTransaction = async (txId: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(txId);
          const [txs, port] = await Promise.all([
            getTransactions(assetId),
            getPortfolio(assetId),
          ]);
          setTransactions(txs);
          setPortfolio(port);
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(timeFrame);
    setRefreshing(false);
  };

  if (loading || !asset) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const currentPrice = last(prices)?.close ?? last(allPrices)?.close ?? 0;
  const holding = portfolio?.quantity ?? 0;
  const marketValue = holding * currentPrice;
  const pnl = holding > 0 && portfolio ? (currentPrice - portfolio.avgCostBasis) * holding : 0;
  const pnlPct = portfolio && portfolio.avgCostBasis > 0
    ? ((currentPrice - portfolio.avgCostBasis) / portfolio.avgCostBasis) * 100
    : 0;
  const icon = ASSET_TYPE_ICONS[asset.type] ?? '📈';
  const recColor = analysis ? RECOMMENDATION_COLORS[analysis.recommendation] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSymbol}>{icon} {asset.symbol}</Text>
          <Text style={styles.headerName} numberOfLines={1}>{asset.name}</Text>
        </View>
        <TouchableOpacity onPress={handleDeleteAsset} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>···</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Holding summary */}
        {holding > 0 && (
          <View style={styles.holdingCard}>
            <View style={styles.holdingRow}>
              <View>
                <Text style={styles.holdingLabel}>Market Value</Text>
                <Text style={styles.holdingValue}>${marketValue.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.holdingLabel}>P&L</Text>
                <Text style={[styles.holdingPnl, { color: pnl >= 0 ? Colors.success : Colors.danger }]}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(1)}%)
                </Text>
              </View>
            </View>
            <View style={styles.holdingRow}>
              <Text style={styles.holdingMeta}>
                {holding.toFixed(4)} shares · avg ${portfolio!.avgCostBasis.toFixed(2)}
              </Text>
              <Text style={styles.holdingMeta}>
                Invested ${portfolio!.totalInvested.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Price chart */}
        {prices.length > 0 && indicators && (
          <PriceChart
            prices={prices}
            indicators={indicators}
            selectedTimeframe={timeFrame}
            onTimeframeChange={handleTimeframeChange}
          />
        )}

        {/* Analysis section */}
        <View style={styles.analysisHeader}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <View style={styles.analysisButtons}>
            <TouchableOpacity
              style={styles.quickAnalyzeBtn}
              onPress={handleQuickAnalyze}
              disabled={analyzing}
            >
              <Text style={styles.quickAnalyzeBtnText}>Rule-Based</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Text style={styles.analyzeBtnText}>🤖 Claude AI</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {analysis ? (
          <RecommendationCard result={analysis} />
        ) : (
          <View style={styles.analysisPlaceholder}>
            <Text style={styles.analysisPlaceholderText}>
              Tap "Rule-Based" for instant technical analysis, or "Claude AI" for deep AI-powered insight.
            </Text>
          </View>
        )}

        {/* Technical indicators */}
        {indicators && (
          <TechnicalIndicatorsPanel
            indicators={indicators}
            currentPrice={currentPrice}
          />
        )}

        {/* Transactions */}
        <TouchableOpacity
          style={styles.txToggle}
          onPress={() => setShowTransactions(!showTransactions)}
        >
          <Text style={styles.sectionTitle}>
            Transactions ({transactions.length})
          </Text>
          <Text style={styles.txToggleIcon}>{showTransactions ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showTransactions && transactions.map(tx => (
          <TransactionItem
            key={tx.id}
            transaction={tx}
            onDelete={() => handleDeleteTransaction(tx.id)}
          />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Add transaction button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => navigation.navigate('AddTransaction', { assetId, type: 'buy' })}
        >
          <Text style={styles.buyBtnText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sellBtn, holding === 0 && styles.btnDisabled]}
          disabled={holding === 0}
          onPress={() => navigation.navigate('AddTransaction', { assetId, type: 'sell' })}
        >
          <Text style={styles.sellBtnText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { color: Colors.primary, fontSize: 28, lineHeight: 30 },
  headerCenter: { flex: 1 },
  headerSymbol: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  headerName: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: Colors.textSecondary, fontSize: 18 },
  scroll: { flex: 1 },
  holdingCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  holdingLabel: { color: Colors.textSecondary, fontSize: 12 },
  holdingValue: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  holdingPnl: { fontSize: 16, fontWeight: '700' },
  holdingMeta: { color: Colors.textMuted, fontSize: 11 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  analysisButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAnalyzeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAnalyzeBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  analyzeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    minWidth: 100,
    alignItems: 'center',
  },
  analyzeBtnDisabled: { backgroundColor: Colors.primaryDark, opacity: 0.6 },
  analyzeBtnText: { color: Colors.background, fontSize: 12, fontWeight: '700' },
  analysisPlaceholder: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  analysisPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  txToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  txToggleIcon: { color: Colors.textSecondary, fontSize: 12 },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyBtnText: { color: Colors.background, fontSize: 15, fontWeight: '700' },
  sellBtn: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sellBtnText: { color: Colors.background, fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
});
