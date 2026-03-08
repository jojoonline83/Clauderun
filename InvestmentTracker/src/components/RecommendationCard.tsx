import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnalysisResult } from '../types';
import { Colors, RECOMMENDATION_COLORS, RECOMMENDATION_LABELS } from '../utils/theme';

interface Props {
  result: AnalysisResult;
}

export default function RecommendationCard({ result }: Props) {
  const recColor = RECOMMENDATION_COLORS[result.recommendation] ?? Colors.hold;
  const label = RECOMMENDATION_LABELS[result.recommendation] ?? result.recommendation;

  const confidenceColor =
    result.confidence >= 70 ? Colors.success :
    result.confidence >= 50 ? Colors.warning : Colors.textSecondary;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: recColor + '22', borderColor: recColor }]}>
          <Text style={[styles.badgeText, { color: recColor }]}>{label}</Text>
        </View>
        <View style={styles.confidenceWrap}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
            {result.confidence}%
          </Text>
        </View>
      </View>

      {/* Target / Stop */}
      {(result.targetPrice || result.stopLoss) && (
        <View style={styles.targets}>
          {result.targetPrice && (
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Target</Text>
              <Text style={[styles.targetValue, { color: Colors.success }]}>
                ${result.targetPrice.toFixed(2)}
              </Text>
            </View>
          )}
          {result.stopLoss && (
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Stop Loss</Text>
              <Text style={[styles.targetValue, { color: Colors.danger }]}>
                ${result.stopLoss.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Reasoning */}
      <Text style={styles.reasoning}>{result.reasoning}</Text>

      {/* Key Factors */}
      {result.keyFactors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Factors</Text>
          {result.keyFactors.map((f, i) => (
            <View key={i} style={styles.factorRow}>
              <Text style={[styles.bullet, { color: Colors.success }]}>✓</Text>
              <Text style={styles.factorText}>{f}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Risks */}
      {result.risks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks</Text>
          {result.risks.map((r, i) => (
            <View key={i} style={styles.factorRow}>
              <Text style={[styles.bullet, { color: Colors.danger }]}>⚠</Text>
              <Text style={styles.factorText}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.timestamp}>
        Generated {new Date(result.generatedAt).toLocaleString()}
      </Text>

      <Text style={styles.disclaimer}>
        This analysis is for informational purposes only and is not financial advice. Always do your own research before investing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confidenceWrap: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  confidenceValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  targets: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
  },
  targetItem: {
    flex: 1,
    alignItems: 'center',
  },
  targetLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  reasoning: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 6,
  },
  bullet: {
    fontSize: 13,
    marginTop: 1,
    width: 16,
  },
  factorText: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 8,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
  },
});
