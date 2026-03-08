import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../types';
import { Colors } from '../utils/theme';

interface Props {
  transaction: Transaction;
  onDelete?: () => void;
}

export default function TransactionItem({ transaction, onDelete }: Props) {
  const isBuy = transaction.type === 'buy';
  const color = isBuy ? Colors.success : Colors.danger;
  const date = new Date(transaction.date);

  return (
    <View style={styles.container}>
      <View style={[styles.typeBadge, { backgroundColor: color + '22', borderColor: color }]}>
        <Text style={[styles.typeText, { color }]}>
          {isBuy ? 'BUY' : 'SELL'}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.symbol}>{transaction.assetSymbol}</Text>
        <Text style={styles.info}>
          {transaction.quantity.toFixed(4)} @ ${transaction.price.toFixed(2)}
        </Text>
        {transaction.notes && (
          <Text style={styles.notes} numberOfLines={1}>{transaction.notes}</Text>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.total, { color }]}>
          {isBuy ? '-' : '+'}${transaction.totalValue.toFixed(2)}
        </Text>
        <Text style={styles.date}>
          {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.deleteBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBadge: {
    width: 48,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  details: {
    flex: 1,
  },
  symbol: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  info: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  notes: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  total: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  deleteBtn: {
    color: Colors.danger,
    fontSize: 14,
    marginTop: 2,
  },
});
