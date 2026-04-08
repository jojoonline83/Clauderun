import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Transaction } from '../types';
import { getTransactions, deleteTransaction } from '../services/storageService';
import TransactionItem from '../components/TransactionItem';
import { Colors } from '../utils/theme';
import { Alert } from 'react-native';

export default function TransactionsScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    const txs = await getTransactions();
    setTransactions(txs.sort((a, b) => b.date - a.date));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDelete = (txId: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(txId);
          await loadTransactions();
        },
      },
    ]);
  };

  // Group by date
  const grouped: { date: string; items: Transaction[] }[] = [];
  let lastDate = '';
  for (const tx of transactions) {
    const dateStr = new Date(tx.date).toLocaleDateString(undefined, {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    if (dateStr !== lastDate) {
      grouped.push({ date: dateStr, items: [tx] });
      lastDate = dateStr;
    } else {
      grouped[grouped.length - 1].items.push(tx);
    }
  }

  const totalBuy = transactions.filter(t => t.type === 'buy').reduce((s, t) => s + t.totalValue, 0);
  const totalSell = transactions.filter(t => t.type === 'sell').reduce((s, t) => s + t.totalValue, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={grouped}
        keyExtractor={item => item.date}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Bought</Text>
                <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                  -${totalBuy.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Sold</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  +${totalSell.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net Flow</Text>
                <Text style={[styles.summaryValue, { color: totalSell - totalBuy >= 0 ? Colors.success : Colors.danger }]}>
                  {totalSell - totalBuy >= 0 ? '+' : '-'}${Math.abs(totalSell - totalBuy).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <Text style={styles.dateHeader}>{item.date}</Text>
            {item.items.map(tx => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onDelete={() => handleDelete(tx.id)}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Add assets and record your buy/sell transactions to track your portfolio performance
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 32 },
  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  divider: { width: 1, backgroundColor: Colors.border },
  dateHeader: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
