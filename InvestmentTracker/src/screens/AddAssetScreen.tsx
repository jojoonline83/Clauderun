import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Asset, AssetType } from '../types';
import { saveAsset } from '../services/storageService';
import { searchSymbols, SearchResult } from '../services/stockService';
import { getSettings } from '../services/storageService';
import { Colors, ASSET_TYPE_ICONS } from '../utils/theme';

const ASSET_TYPES: { type: AssetType; label: string }[] = [
  { type: 'stock', label: 'Stock' },
  { type: 'etf', label: 'ETF' },
  { type: 'fund', label: 'Fund' },
  { type: 'bond', label: 'Bond' },
  { type: 'crypto', label: 'Crypto' },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function AddAssetScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);

  const searchTimeout = useRef<any>(null);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 1) {
      setResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const settings = await getSettings();
      const res = await searchSymbols(text, settings.alphaVantageApiKey);
      setResults(res);
      setSearching(false);
    }, 400);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setSelected(result);
    setQuery(result.symbol);
    setCustomName(result.name);
    // Infer type
    const typeMap: Record<string, AssetType> = {
      'etf': 'etf',
      'equity': 'stock',
      'bond': 'bond',
      'mutual fund': 'fund',
      'cryptocurrency': 'crypto',
      'crypto': 'crypto',
      'ccc': 'crypto',
    };
    const inferredType = typeMap[result.type.toLowerCase()] ?? 'stock';
    setAssetType(inferredType);
    setResults([]);
  };

  const handleSave = async () => {
    const symbol = (selected?.symbol ?? query).trim().toUpperCase();
    const name = customName.trim() || selected?.name || symbol;

    if (!symbol) {
      Alert.alert('Error', 'Please enter a symbol');
      return;
    }

    setSaving(true);
    try {
      const asset: Asset = {
        id: generateId(),
        symbol,
        name,
        type: assetType,
        currency: 'USD',
        addedAt: Date.now(),
      };
      await saveAsset(asset);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Asset</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Symbol search */}
        <Text style={styles.label}>Symbol</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="AAPL, TSLA, SPY..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color={Colors.primary} style={styles.searchSpinner} />}
        </View>

        {/* Search results */}
        {results.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={results}
              keyExtractor={item => item.symbol}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.dropdownLeft}>
                    <Text style={styles.dropdownSymbol}>{item.symbol}</Text>
                    <Text style={styles.dropdownName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={styles.dropdownType}>{item.type.toUpperCase()}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 220 }}
            />
          </View>
        )}

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={customName}
          onChangeText={setCustomName}
          placeholder="Company or fund name"
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
        />

        {/* Asset type */}
        <Text style={styles.label}>Asset Type</Text>
        <View style={styles.typeRow}>
          {ASSET_TYPES.map(({ type, label }) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtn, assetType === type && styles.typeBtnActive]}
              onPress={() => setAssetType(type)}
            >
              <Text style={styles.typeIcon}>{ASSET_TYPE_ICONS[type]}</Text>
              <Text style={[styles.typeBtnText, assetType === type && styles.typeBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Popular symbols</Text>
          <View style={styles.tipsRow}>
            {['AAPL', 'MSFT', 'TSLA', 'SPY', 'BTC-USD', 'AGG'].map(sym => (
              <TouchableOpacity
                key={sym}
                style={styles.tipChip}
                onPress={() => handleSearch(sym)}
              >
                <Text style={styles.tipChipText}>{sym}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelBtn: { padding: 4 },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  saveBtn: { padding: 4, minWidth: 40, alignItems: 'flex-end' },
  saveText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  content: { padding: 16 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 16,
  },
  searchRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
  },
  searchSpinner: { position: 'absolute', right: 12 },
  dropdown: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '44',
  },
  dropdownLeft: { flex: 1 },
  dropdownSymbol: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  dropdownName: { color: Colors.textSecondary, fontSize: 12 },
  dropdownType: { color: Colors.textMuted, fontSize: 11 },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark + '33',
  },
  typeIcon: { fontSize: 16 },
  typeBtnText: { color: Colors.textSecondary, fontSize: 13 },
  typeBtnTextActive: { color: Colors.primary, fontWeight: '600' },
  tipsCard: {
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  tipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipChipText: { color: Colors.primary, fontSize: 13, fontWeight: '500' },
});
