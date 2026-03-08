import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Transaction, Asset } from '../types';
import { saveTransaction, getAssets } from '../services/storageService';
import { fetchQuote } from '../services/stockService';
import { Colors } from '../utils/theme';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function AddTransactionScreen({ route, navigation }: any) {
  const { assetId, type: initType = 'buy' } = route.params ?? {};
  const [asset, setAsset] = useState<Asset | null>(null);
  const [txType, setTxType] = useState<'buy' | 'sell'>(initType);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    (async () => {
      const assets = await getAssets();
      const found = assets.find(a => a.id === assetId);
      setAsset(found ?? null);

      if (found) {
        setLoadingPrice(true);
        const quote = await fetchQuote(found.symbol);
        if (quote) setPrice(quote.price.toFixed(2));
        setLoadingPrice(false);
      }
    })();
  }, [assetId]);

  const total = parseFloat(quantity) * parseFloat(price);

  const handleSave = async () => {
    const qty = parseFloat(quantity);
    const px = parseFloat(price);

    if (!qty || qty <= 0) { Alert.alert('Error', 'Please enter a valid quantity'); return; }
    if (!px || px <= 0) { Alert.alert('Error', 'Please enter a valid price'); return; }
    if (!asset) { Alert.alert('Error', 'Asset not found'); return; }

    setSaving(true);
    try {
      const tx: Transaction = {
        id: generateId(),
        assetId: asset.id,
        assetSymbol: asset.symbol,
        type: txType,
        quantity: qty,
        price: px,
        totalValue: qty * px,
        date: Date.now(),
        notes: notes.trim() || undefined,
      };
      await saveTransaction(tx);
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {txType === 'buy' ? '🟢 Buy' : '🔴 Sell'} {asset?.symbol ?? ''}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Text style={styles.saveText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Type toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, txType === 'buy' && styles.buyActive]}
            onPress={() => setTxType('buy')}
          >
            <Text style={[styles.typeBtnText, txType === 'buy' && { color: Colors.background }]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, txType === 'sell' && styles.sellActive]}
            onPress={() => setTxType('sell')}
          >
            <Text style={[styles.typeBtnText, txType === 'sell' && { color: Colors.background }]}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quantity */}
        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0.0000"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Price per Share {loadingPrice ? '(loading...)' : ''}
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Total */}
        {!isNaN(total) && total > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total {txType === 'buy' ? 'Cost' : 'Proceeds'}</Text>
            <Text style={[styles.totalValue, { color: txType === 'buy' ? Colors.danger : Colors.success }]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  saveText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  scroll: { flex: 1, padding: 16 },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyActive: { backgroundColor: Colors.success },
  sellActive: { backgroundColor: Colors.danger },
  typeBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  field: { marginBottom: 16 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  currencySymbol: {
    color: Colors.textSecondary,
    fontSize: 16,
    paddingLeft: 12,
    paddingRight: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  totalLabel: { color: Colors.textSecondary, fontSize: 13 },
  totalValue: { fontSize: 22, fontWeight: '700' },
});
