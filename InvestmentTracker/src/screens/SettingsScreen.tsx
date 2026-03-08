import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Switch
} from 'react-native';
import { getSettings, saveSettings } from '../services/storageService';
import { AppSettings } from '../types';
import { Colors } from '../utils/theme';

export default function SettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<AppSettings>({
    anthropicApiKey: '',
    alphaVantageApiKey: '',
    currency: 'USD',
    theme: 'dark',
  });
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showAlphaKey, setShowAlphaKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Claude / Anthropic */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI Analysis (Claude)</Text>
          <Text style={styles.sectionDesc}>
            Add your Anthropic API key to enable AI-powered buy/sell recommendations using Claude Opus.
          </Text>

          <Text style={styles.label}>Anthropic API Key</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={settings.anthropicApiKey}
              onChangeText={v => setSettings(s => ({ ...s, anthropicApiKey: v }))}
              placeholder="sk-ant-api..."
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showAnthropicKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowAnthropicKey(!showAnthropicKey)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showAnthropicKey ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Get your key at console.anthropic.com · Used only on-device
          </Text>
        </View>

        {/* Alpha Vantage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Market Data (Alpha Vantage)</Text>
          <Text style={styles.sectionDesc}>
            Optional: Add an Alpha Vantage API key for more reliable market data. Without it, the app uses Yahoo Finance (free, no key needed) or demo data.
          </Text>

          <Text style={styles.label}>Alpha Vantage API Key</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={settings.alphaVantageApiKey}
              onChangeText={v => setSettings(s => ({ ...s, alphaVantageApiKey: v }))}
              placeholder="Your Alpha Vantage key..."
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showAlphaKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowAlphaKey(!showAlphaKey)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showAlphaKey ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Free tier at alphavantage.co (25 req/day)
          </Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              <Text style={styles.bold}>Investment Tracker</Text> is an open-source mobile app
              for tracking stocks, ETFs, funds, bonds, and crypto.
            </Text>
            <Text style={[styles.aboutText, { marginTop: 8 }]}>
              <Text style={styles.bold}>AI Analysis</Text> is powered by Claude (Anthropic) using
              technical indicators including RSI, MACD, Bollinger Bands, SMA/EMA crossovers,
              volume analysis, and support/resistance levels.
            </Text>
            <Text style={[styles.aboutText, { marginTop: 8, color: Colors.textMuted }]}>
              ⚠️ This app does not provide financial advice. All analysis is for educational purposes only.
              Always consult a licensed financial advisor before investing.
            </Text>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnSaved]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {saved ? '✓ Saved!' : 'Save Settings'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 16 },
  hint: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  aboutCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
  },
  aboutText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  bold: { fontWeight: '700', color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnSaved: { backgroundColor: Colors.success },
  saveBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
