import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import ImagePickerButton from '../components/ImagePickerButton';
import MedicationCard from '../components/MedicationCard';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { searchMedication, Medication } from '../services/database';
import { recognizeMedicationFromImage } from '../services/aiService';

type AppState = 'idle' | 'searching' | 'analyzing' | 'done';

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<Medication | null | undefined>(undefined);
  const [recognizedName, setRecognizedName] = useState<string>('');

  const handleSearch = (query: string) => {
    setAppState('searching');
    const found = searchMedication(query);
    setResult(found);
    setRecognizedName('');
    setAppState('done');
  };

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setAppState('analyzing');
    setResult(undefined);
    setRecognizedName('');

    try {
      const name = await recognizeMedicationFromImage(base64, mimeType as 'image/jpeg');

      if (!name || name === 'UNKNOWN') {
        setResult(null);
        setRecognizedName('UNKNOWN');
        setAppState('done');
        return;
      }

      setRecognizedName(name);
      const found = searchMedication(name);
      setResult(found);
      setAppState('done');
    } catch (error: unknown) {
      setAppState('idle');
      const message = error instanceof Error ? error.message : t.imageError;
      Alert.alert('Error', message);
    }
  };

  const handleReset = () => {
    setResult(undefined);
    setRecognizedName('');
    setAppState('idle');
  };

  const isLoading = appState === 'searching' || appState === 'analyzing';
  const loadingText = appState === 'analyzing' ? t.analyzingImage : t.loading;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={styles.headerText}>
          <Text style={[styles.appName, isRTL && styles.textRTL]}>{t.appName}</Text>
          <Text style={[styles.appSubtitle, isRTL && styles.textRTL]}>{t.appSubtitle}</Text>
        </View>
        <LanguageToggle />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Input section — hide when showing results */}
          {appState !== 'done' && (
            <View style={styles.inputSection}>
              <View style={styles.card}>
                <SearchBar onSearch={handleSearch} loading={appState === 'searching'} />

                <View style={[styles.dividerRow, isRTL && styles.dividerRowRTL]}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t.orDivider}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <ImagePickerButton
                  onImageSelected={handleImageSelected}
                  loading={appState === 'analyzing'}
                />
              </View>

              {/* Category legend */}
              <View style={styles.legendCard}>
                <Text style={[styles.legendTitle, isRTL && styles.textRTL]}>
                  {t.categoryLegendTitle}
                </Text>
                {Object.entries(t.categories).map(([cat, desc]) => (
                  <View key={cat} style={[styles.legendRow, isRTL && styles.legendRowRTL]}>
                    <View
                      style={[
                        styles.legendBadge,
                        { backgroundColor: getCategoryColorInline(cat) },
                      ]}
                    >
                      <Text style={styles.legendBadgeText}>{cat}</Text>
                    </View>
                    <Text style={[styles.legendDesc, isRTL && styles.textRTL]}>{desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, isRTL && styles.textRTL]}>{loadingText}</Text>
            </View>
          )}

          {/* Results */}
          {appState === 'done' && result !== undefined && (
            <View style={styles.resultSection}>
              {recognizedName && recognizedName !== 'UNKNOWN' && (
                <View style={[styles.recognizedBanner, isRTL && styles.recognizedBannerRTL]}>
                  <Text style={[styles.recognizedLabel, isRTL && styles.textRTL]}>
                    {t.recognized}
                  </Text>
                  <Text style={[styles.recognizedName, isRTL && styles.textRTL]}>
                    {recognizedName}
                  </Text>
                </View>
              )}
              <MedicationCard
                medication={result}
                recognizedName={recognizedName}
                onReset={handleReset}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getCategoryColorInline(cat: string): string {
  const map: Record<string, string> = {
    A: '#16a34a',
    B1: '#22c55e',
    B2: '#4ade80',
    B3: '#84cc16',
    C: '#f59e0b',
    D: '#ea580c',
    X: '#dc2626',
  };
  return map[cat] ?? '#6b7280';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f766e',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  inputSection: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerRowRTL: {
    flexDirection: 'row-reverse',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 1,
  },
  legendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendRowRTL: {
    flexDirection: 'row-reverse',
  },
  legendBadge: {
    width: 32,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  legendBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  legendDesc: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#0f766e',
    fontWeight: '500',
  },
  resultSection: {
    gap: 12,
  },
  recognizedBanner: {
    backgroundColor: '#f0fdfa',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#5eead4',
  },
  recognizedBannerRTL: {
    flexDirection: 'row-reverse',
  },
  recognizedLabel: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '500',
  },
  recognizedName: {
    fontSize: 13,
    color: '#134e4a',
    fontWeight: '700',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
