import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import MedicationCard from '../components/MedicationCard';
import { useLanguage } from '../context/LanguageContext';
import {
  searchMedication,
  Medication,
  IngredientResult,
  CATEGORY_RANK,
  getOverallCategory,
} from '../services/database';
import { recognizeMedicationFromImage } from '../services/aiService';
import * as ImagePicker from 'expo-image-picker';

type AppState = 'idle' | 'searching' | 'analyzing' | 'done';

const CATEGORY_CHIPS = [
  { cat: 'A',  color: '#006a61', bg: '#e6f4f2' },
  { cat: 'B1', color: '#0891b2', bg: '#e0f2fe' },
  { cat: 'B2', color: '#0891b2', bg: '#e0f2fe' },
  { cat: 'B3', color: '#7c3aed', bg: '#ede9fe' },
  { cat: 'C',  color: '#d97706', bg: '#fef3c7' },
  { cat: 'D',  color: '#dc2626', bg: '#fee2e2' },
  { cat: 'X',  color: '#991b1b', bg: '#fee2e2' },
];

const NAV_ITEMS = [
  { icon: '🛡️', label: 'SAFETY',  labelAr: 'السلامة' },
  { icon: '📷', label: 'SCAN',    labelAr: 'مسح'     },
  { icon: '🕐', label: 'HISTORY', labelAr: 'السجل'   },
  { icon: '📖', label: 'GUIDE',   labelAr: 'الدليل'  },
];

function catColor(cat: string): string {
  const map: Record<string, string> = {
    A: '#006a61', B1: '#0891b2', B2: '#0891b2', B3: '#7c3aed',
    C: '#d97706', D: '#dc2626', X: '#991b1b',
  };
  return map[cat] ?? '#6b7280';
}

export default function HomeScreen() {
  const { t, language, isRTL, toggleLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<Medication | null | undefined>(undefined);
  const [recognizedName, setRecognizedName] = useState<string>('');
  const [ingredientResults, setIngredientResults] = useState<IngredientResult[]>([]);

  const handleSearch = (query: string) => {
    setAppState('searching');
    const found = searchMedication(query);
    setResult(found);
    setRecognizedName('');
    setIngredientResults([]);
    setAppState('done');
  };

  const handleImageResult = async (base64: string, mimeType: string) => {
    setAppState('analyzing');
    setResult(undefined);
    setRecognizedName('');
    setIngredientResults([]);

    try {
      const groups = await recognizeMedicationFromImage(base64, mimeType as 'image/jpeg');

      if (!groups.length || groups[0][0] === 'UNKNOWN') {
        setResult(null);
        setRecognizedName('UNKNOWN');
        setAppState('done');
        return;
      }

      const results: IngredientResult[] = groups.map((names) => {
        let found: Medication | null = null;
        let matchedName = names[0];
        for (const name of names) {
          found = searchMedication(name);
          if (found) { matchedName = name; break; }
        }
        return { names, matchedName, medication: found };
      });

      results.sort((a, b) => {
        const rankA = a.medication ? (CATEGORY_RANK[a.medication.pregnancyCategory] ?? 0) : -1;
        const rankB = b.medication ? (CATEGORY_RANK[b.medication.pregnancyCategory] ?? 0) : -1;
        return rankB - rankA;
      });

      setIngredientResults(results);
      setRecognizedName(groups[0][0]);
      if (results.length === 1) setResult(results[0].medication);
      setAppState('done');
    } catch (error: unknown) {
      setAppState('idle');
      Alert.alert('Error', error instanceof Error ? error.message : t.imageError);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('', t.permissionDenied); return; }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8, allowsEditing: true, aspect: [4, 3], base64: true,
    });
    if (!res.canceled && res.assets[0]?.base64)
      handleImageResult(res.assets[0].base64, res.assets[0].mimeType ?? 'image/jpeg');
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('', t.permissionDenied); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [4, 3], base64: true,
    });
    if (!res.canceled && res.assets[0]?.base64)
      handleImageResult(res.assets[0].base64, res.assets[0].mimeType ?? 'image/jpeg');
  };

  const handleReset = () => {
    setResult(undefined);
    setRecognizedName('');
    setIngredientResults([]);
    setAppState('idle');
  };

  const isLoading = appState === 'searching' || appState === 'analyzing';
  const isResults = appState === 'done' && (result !== undefined || ingredientResults.length > 0);

  return (
    <View style={styles.root}>
      {/* Teal header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }, isRTL && styles.rowReverse]}>
        <Text style={styles.appLogo}>🌿 {t.appName}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle} activeOpacity={0.8}>
          <Text style={styles.langGlobe}>🌐</Text>
          <Text style={styles.langLabel}>{language === 'en' ? 'ع' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero tagline — only on idle/loading home screen */}
          {!isResults && !isLoading && (
            <View style={styles.heroSection}>
              <Text style={[styles.heroTagline, isRTL && styles.textRTL]}>
                {language === 'ar' ? (
                  <>
                    {'الأمان لكِ ولـ'}
                    <Text style={styles.heroAccent}>{'طفلكِ الصغير'}</Text>
                    {'.'}
                  </>
                ) : (
                  <>
                    {'Safety for you and your '}
                    <Text style={styles.heroAccent}>little one</Text>
                    {'.'}
                  </>
                )}
              </Text>
              <Text style={[styles.heroSub, isRTL && styles.textRTL]}>{t.appSubtitle}</Text>
            </View>
          )}

          {/* Search bar — visible except during results */}
          {!isResults && (
            <SearchBar onSearch={handleSearch} loading={appState === 'searching'} />
          )}

          {/* Feature cards + category guide — idle only */}
          {!isResults && !isLoading && (
            <>
              <View style={[styles.featureRow, isRTL && styles.rowReverse]}>
                <TouchableOpacity style={styles.featureCard} onPress={takePhoto} activeOpacity={0.85}>
                  <View style={styles.featureIconBox}>
                    <Text style={styles.featureIconText}>📷</Text>
                  </View>
                  <View style={styles.featureCardBody}>
                    <Text style={[styles.featureCardTitle, isRTL && styles.textRTL]}>{t.cameraButton}</Text>
                    <Text style={[styles.featureCardDesc, isRTL && styles.textRTL]}>
                      {language === 'ar' ? 'التقطي صورة للدواء' : 'Scan medication label'}
                    </Text>
                  </View>
                  <Text style={[styles.featureArrow, isRTL && styles.featureArrowFlip]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.featureCard} onPress={pickFromGallery} activeOpacity={0.85}>
                  <View style={styles.featureIconBox}>
                    <Text style={styles.featureIconText}>🖼️</Text>
                  </View>
                  <View style={styles.featureCardBody}>
                    <Text style={[styles.featureCardTitle, isRTL && styles.textRTL]}>{t.galleryButton}</Text>
                    <Text style={[styles.featureCardDesc, isRTL && styles.textRTL]}>
                      {language === 'ar' ? 'اختاري من معرض الصور' : 'Choose from gallery'}
                    </Text>
                  </View>
                  <Text style={[styles.featureArrow, isRTL && styles.featureArrowFlip]}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Category guide */}
              <View style={styles.categoryGuide}>
                <Text style={[styles.guideTitle, isRTL && styles.textRTL]}>{t.categoryLegendTitle}</Text>
                <View style={[styles.guideChips, isRTL && styles.rowReverse]}>
                  {CATEGORY_CHIPS.map(({ cat, color, bg }) => (
                    <View key={cat} style={[styles.guideChip, { backgroundColor: bg }]}>
                      <Text style={[styles.guideChipText, { color }]}>{cat}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.guideDescList}>
                  {Object.entries(t.categories).map(([cat, desc]) => (
                    <View key={cat} style={[styles.guideDescRow, isRTL && styles.rowReverse]}>
                      <Text style={[styles.guideDescCat, { color: catColor(cat) }]}>{cat}</Text>
                      <Text style={[styles.guideDescText, isRTL && styles.textRTL]}>{desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#006a61" />
              <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
                {appState === 'analyzing' ? t.analyzingImage : t.loading}
              </Text>
            </View>
          )}

          {/* Results */}
          {isResults && (
            <MedicationCard
              medication={
                ingredientResults.length > 0
                  ? (getOverallCategory(ingredientResults)
                      ? ingredientResults.find((r) => r.medication)?.medication ?? null
                      : null)
                  : result
              }
              recognizedName={recognizedName}
              ingredientResults={ingredientResults.length > 0 ? ingredientResults : undefined}
              onReset={handleReset}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === (isResults ? 0 : 1);
          return (
            <TouchableOpacity
              key={i}
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={i === 0 && isResults ? handleReset : undefined}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {language === 'ar' ? item.labelAr : item.label}
              </Text>
              {isActive && <View style={styles.navDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#006a61',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  appLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langGlobe: {
    fontSize: 15,
  },
  langLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f6faf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heroSection: {
    gap: 6,
  },
  heroTagline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#181c1c',
    lineHeight: 34,
  },
  heroAccent: {
    color: '#006a61',
  },
  heroSub: {
    fontSize: 14,
    color: '#4b6b68',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e6f4f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureCardBody: {
    flex: 1,
    gap: 2,
  },
  featureCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181c1c',
  },
  featureCardDesc: {
    fontSize: 11,
    color: '#4b6b68',
  },
  featureArrow: {
    fontSize: 22,
    color: '#006a61',
    fontWeight: '300',
  },
  featureArrowFlip: {
    transform: [{ scaleX: -1 }],
  },
  categoryGuide: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b6b68',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  guideChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  guideChip: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  guideChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  guideDescList: {
    gap: 7,
  },
  guideDescRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  guideDescCat: {
    fontSize: 11,
    fontWeight: '800',
    width: 22,
    marginTop: 2,
  },
  guideDescText: {
    flex: 1,
    fontSize: 12,
    color: '#4b6b68',
    lineHeight: 18,
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#006a61',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingTop: 10,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
    paddingBottom: 4,
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: '#006a61',
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#006a61',
    marginTop: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
