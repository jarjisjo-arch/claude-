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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import MedicationCard from '../components/MedicationCard';
import HistoryScreen from './HistoryScreen';
import GuideScreen from './GuideScreen';
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
type Tab = 'home' | 'history' | 'guide';

export interface SearchRecord {
  id: string;
  query: string;
  timestamp: Date;
  medication: Medication | null;
  ingredientResults: IngredientResult[];
  searchType: 'text' | 'image';
  overallCategory: string | null;
}

export default function HomeScreen() {
  const { t, language, isRTL, toggleLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  // Navigation
  const [currentTab, setCurrentTab] = useState<Tab>('home');

  // Search state
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<Medication | null | undefined>(undefined);
  const [recognizedName, setRecognizedName] = useState('');
  const [ingredientResults, setIngredientResults] = useState<IngredientResult[]>([]);

  // History
  const [searchHistory, setSearchHistory] = useState<SearchRecord[]>([]);

  const ar = (en: string, arStr: string) => language === 'ar' ? arStr : en;

  // ── Save to history ────────────────────────────────────────────────────────
  const saveHistory = (
    query: string,
    med: Medication | null,
    ingredients: IngredientResult[],
    type: 'text' | 'image'
  ) => {
    const overall = ingredients.length > 0 ? getOverallCategory(ingredients) : med?.pregnancyCategory ?? null;
    const record: SearchRecord = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      medication: med,
      ingredientResults: ingredients,
      searchType: type,
      overallCategory: overall,
    };
    setSearchHistory(prev => [record, ...prev].slice(0, 50));
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    setAppState('searching');
    const found = searchMedication(query);
    setResult(found);
    setRecognizedName('');
    setIngredientResults([]);
    setAppState('done');
    saveHistory(query, found, [], 'text');
  };

  const handleImageResult = async (base64: string, mimeType: string) => {
    setCurrentTab('home');
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
        saveHistory('Unknown', null, [], 'image');
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
      saveHistory(groups[0][0], results[0]?.medication ?? null, results, 'image');
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

  // ── Derived state ──────────────────────────────────────────────────────────
  const isLoading = appState === 'searching' || appState === 'analyzing';
  const isResults = currentTab === 'home' && appState === 'done' &&
    (result !== undefined || ingredientResults.length > 0);

  const activeNavIndex =
    currentTab === 'history' ? 2 :
    currentTab === 'guide'   ? 3 :
    isResults                ? 1 : 0;

  // ── Nav handler ────────────────────────────────────────────────────────────
  const handleNavPress = (index: number) => {
    if (index === 0) {
      setCurrentTab('home');
      if (isResults) handleReset();
    } else if (index === 1) {
      takePhoto();
    } else if (index === 2) {
      setCurrentTab('history');
    } else if (index === 3) {
      setCurrentTab('guide');
    }
  };

  const NAV = [
    { icon: 'shield-heart' as const, label: ar('SAFETY', 'السلامة') },
    { icon: 'camera'       as const, label: ar('SCAN',   'مسح')    },
    { icon: 'history'      as const, label: ar('HISTORY','السجل')  },
    { icon: 'book-open-variant' as const, label: ar('GUIDE','الدليل') },
  ];

  return (
    <View style={styles.root}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 6 },
        isRTL && styles.rowRev]}>
        <View style={[styles.brand, isRTL && styles.rowRev]}>
          <MaterialCommunityIcons name="spa" size={26} color="#006a61" />
          <Text style={styles.brandText}>Pregna AI</Text>
        </View>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage} activeOpacity={0.7}>
          <MaterialCommunityIcons name="translate" size={17} color="#006a61" />
          <Text style={styles.langBtnText}>EN/AR</Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {currentTab === 'history' ? (
        <HistoryScreen history={searchHistory} language={language} isRTL={isRTL} t={t} />
      ) : currentTab === 'guide' ? (
        <GuideScreen language={language} isRTL={isRTL} />
      ) : (
        <KeyboardAvoidingView style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* ── IDLE HOME ─────────────────────────────────────────────── */}
            {!isResults && !isLoading && (
              <>
                {/* Hero */}
                <View style={styles.hero}>
                  <View style={styles.heroBlobTR} pointerEvents="none" />
                  <View style={styles.heroBlobBL} pointerEvents="none" />
                  <View style={styles.heroInner}>
                    <Text style={[styles.heroTagline, isRTL && styles.rtl]}>
                      {language === 'ar' ? (
                        <>{'الأمان لكِ ولـ'}<Text style={styles.accent}>{'طفلكِ الصغير'}</Text>{'.'}</>
                      ) : (
                        <>{'Safety for you\nand your '}<Text style={styles.accent}>little one</Text>{'.'}</>
                      )}
                    </Text>
                    <SearchBar onSearch={handleSearch} loading={appState === 'searching'} />
                  </View>
                </View>

                {/* Action cards */}
                <View style={[styles.row, isRTL && styles.rowRev]}>
                  <TouchableOpacity style={styles.actionCard} onPress={takePhoto} activeOpacity={0.85}>
                    <View style={styles.actionTop}>
                      <View style={[styles.actionIconBox, { backgroundColor: 'rgba(0,106,97,0.12)' }]}>
                        <MaterialCommunityIcons name="camera" size={30} color="#006a61" />
                      </View>
                      <MaterialCommunityIcons name="arrow-top-right" size={18} color="#6e7977" />
                    </View>
                    <Text style={[styles.actionTitle, isRTL && styles.rtl]}>{t.cameraButton}</Text>
                    <Text style={[styles.actionDesc, isRTL && styles.rtl]}>
                      {ar('Instant scan your medication for analysis.', 'التقطي صورة للدواء للتحليل الفوري.')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={pickFromGallery} activeOpacity={0.85}>
                    <View style={styles.actionTop}>
                      <View style={[styles.actionIconBox, { backgroundColor: 'rgba(37,104,98,0.1)' }]}>
                        <MaterialCommunityIcons name="file-upload" size={30} color="#256862" />
                      </View>
                      <MaterialCommunityIcons name="arrow-top-right" size={18} color="#6e7977" />
                    </View>
                    <Text style={[styles.actionTitle, isRTL && styles.rtl]}>{t.galleryButton}</Text>
                    <Text style={[styles.actionDesc, isRTL && styles.rtl]}>
                      {ar('Choose a photo from your gallery.', 'اختاري صورة من معرض الصور.')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Ad placement — reserved space for future banner ad */}
                <View style={styles.adPlaceholder} />
              </>
            )}

            {/* ── LOADING ─────────────────────────────────────────────────── */}
            {isLoading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#006a61" />
                <Text style={[styles.loadingText, isRTL && styles.rtl]}>
                  {appState === 'analyzing' ? t.analyzingImage : t.loading}
                </Text>
              </View>
            )}

            {/* ── RESULTS ─────────────────────────────────────────────────── */}
            {isResults && (
              <MedicationCard
                medication={
                  ingredientResults.length > 0
                    ? (getOverallCategory(ingredientResults)
                        ? ingredientResults.find(r => r.medication)?.medication ?? null
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
      )}

      {/* ── Bottom Nav ──────────────────────────────────────────────────── */}
      <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {NAV.map((item, i) => {
          const active = i === activeNavIndex;
          return (
            <TouchableOpacity key={i} style={[styles.navItem, active && styles.navItemActive]}
              activeOpacity={0.75} onPress={() => handleNavPress(i)}>
              <MaterialCommunityIcons name={item.icon} size={22}
                color={active ? '#ffffff' : 'rgba(24,28,28,0.38)'} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f6faf9' },
  flex:    { flex: 1 },
  row:     { flexDirection: 'row', gap: 14 },
  rowRev:  { flexDirection: 'row-reverse' },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },
  accent:  { color: '#006a61' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: 'rgba(246,250,249,0.96)',
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, zIndex: 10,
  },
  brand:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText:   { fontSize: 21, fontWeight: '800', color: '#006a61', letterSpacing: -0.4 },
  langBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#ebefee', borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 7 },
  langBtnText: { fontSize: 12, fontWeight: '700', color: '#006a61' },

  // Scroll
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28, gap: 16 },

  // Hero
  hero: {
    borderRadius: 32, backgroundColor: '#ebefee',
    minHeight: 260, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBlobTR: {
    position: 'absolute', top: -50, right: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#adefe7', opacity: 0.55,
  },
  heroBlobBL: {
    position: 'absolute', bottom: -35, left: -25,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#006a61', opacity: 0.07,
  },
  heroInner:   { width: '100%', paddingHorizontal: 24, paddingVertical: 32, gap: 20, alignItems: 'center' },
  heroTagline: { fontSize: 32, fontWeight: '800', color: '#181c1c', letterSpacing: -0.6, lineHeight: 40, textAlign: 'center' },

  // Action cards
  actionCard: {
    flex: 1, backgroundColor: '#f0f4f3', borderRadius: 28,
    padding: 18, gap: 12, minHeight: 190,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  actionTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actionIconBox:{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionTitle:  { fontSize: 17, fontWeight: '800', color: '#181c1c', letterSpacing: -0.2 },
  actionDesc:   { fontSize: 12, color: '#3e4947', lineHeight: 17 },

  // Ad placeholder
  adPlaceholder: { height: 60, borderRadius: 12, backgroundColor: '#ebefee' },

  // Loading
  loadingBox:  { paddingVertical: 100, alignItems: 'center', gap: 18 },
  loadingText: { fontSize: 15, color: '#006a61', fontWeight: '600' },

  // Bottom nav
  nav: {
    flexDirection: 'row', backgroundColor: 'rgba(246,250,249,0.97)',
    paddingTop: 10, alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: 10, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: '#181c1c', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 16, elevation: 10,
  },
  navItem: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6, paddingHorizontal: 10, gap: 3, borderRadius: 9999,
  },
  navItemActive: {
    backgroundColor: '#006a61', width: 58, height: 58, borderRadius: 29,
    marginTop: -22, paddingHorizontal: 0,
    shadowColor: '#006a61', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  navLabel:      { fontSize: 9, color: 'rgba(24,28,28,0.4)', fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  navLabelActive:{ color: '#ffffff', fontSize: 8 },
});
