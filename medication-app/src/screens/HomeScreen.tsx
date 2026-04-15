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

// Bottom nav item definitions
const NAV_ITEMS = [
  { icon: 'shield-heart' as const, label: 'SAFETY', labelAr: 'السلامة' },
  { icon: 'camera' as const,       label: 'SCAN',   labelAr: 'مسح'     },
  { icon: 'history' as const,      label: 'HISTORY', labelAr: 'السجل'  },
  { icon: 'book-open-variant' as const, label: 'GUIDE', labelAr: 'الدليل' },
];

export default function HomeScreen() {
  const { t, language, isRTL, toggleLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<Medication | null | undefined>(undefined);
  const [recognizedName, setRecognizedName] = useState<string>('');
  const [ingredientResults, setIngredientResults] = useState<IngredientResult[]>([]);

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  // ── Derived state ──────────────────────────────────────────────────────────
  const isLoading = appState === 'searching' || appState === 'analyzing';
  const isResults = appState === 'done' && (result !== undefined || ingredientResults.length > 0);
  // Safety (0) active on home; Scan (1) active on results
  const activeNavIndex = isResults ? 1 : 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const ar = (en: string, arStr: string) => language === 'ar' ? arStr : en;

  return (
    <View style={styles.root}>

      {/* ── Top App Bar ────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }, isRTL && styles.rowRev]}>
        <View style={[styles.headerBrand, isRTL && styles.rowRev]}>
          <MaterialCommunityIcons name="spa" size={26} color="#006a61" />
          <Text style={styles.appTitle}>Pregna AI</Text>
        </View>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage} activeOpacity={0.7}>
          <MaterialCommunityIcons name="translate" size={18} color="#006a61" />
          <Text style={styles.langBtnText}>EN/AR</Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── IDLE HOME SCREEN ─────────────────────────────────────────── */}
          {!isResults && !isLoading && (
            <>
              {/* Hero section */}
              <View style={styles.heroSection}>
                {/* Decorative background blobs */}
                <View style={styles.heroBlobTR} pointerEvents="none" />
                <View style={styles.heroBlobBL} pointerEvents="none" />

                <View style={styles.heroInner}>
                  <Text style={[styles.heroTagline, isRTL && styles.textRTL]}>
                    {language === 'ar' ? (
                      <>
                        {'الأمان لكِ ولـ'}
                        <Text style={styles.heroAccent}>{'طفلكِ الصغير'}</Text>
                        {'.'}
                      </>
                    ) : (
                      <>
                        {'Safety for you\nand your '}
                        <Text style={styles.heroAccent}>little one</Text>
                        {'.'}
                      </>
                    )}
                  </Text>
                  {/* Unified search bar inside hero */}
                  <SearchBar onSearch={handleSearch} loading={appState === 'searching'} />
                </View>
              </View>

              {/* Quick Actions Bento — 2 cards */}
              <View style={[styles.actionsRow, isRTL && styles.rowRev]}>

                {/* Take Photo */}
                <TouchableOpacity style={styles.actionCard} onPress={takePhoto} activeOpacity={0.85}>
                  <View style={styles.actionCardTop}>
                    <View style={styles.cameraIconBox}>
                      <MaterialCommunityIcons name="camera" size={34} color="#006a61" />
                    </View>
                    <MaterialCommunityIcons name="arrow-top-right" size={20} color="#6e7977" />
                  </View>
                  <View style={styles.actionCardBottom}>
                    <Text style={[styles.actionCardTitle, isRTL && styles.textRTL]}>{t.cameraButton}</Text>
                    <Text style={[styles.actionCardDesc, isRTL && styles.textRTL]}>
                      {ar(
                        'Instant scan your medication packaging for immediate safety analysis.',
                        'التقطي صورة للدواء للتحليل الفوري.'
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Upload Image */}
                <TouchableOpacity style={styles.actionCard} onPress={pickFromGallery} activeOpacity={0.85}>
                  <View style={styles.actionCardTop}>
                    <View style={styles.uploadIconBox}>
                      <MaterialCommunityIcons name="file-upload" size={34} color="#256862" />
                    </View>
                    <MaterialCommunityIcons name="arrow-top-right" size={20} color="#6e7977" />
                  </View>
                  <View style={styles.actionCardBottom}>
                    <Text style={[styles.actionCardTitle, isRTL && styles.textRTL]}>{t.galleryButton}</Text>
                    <Text style={[styles.actionCardDesc, isRTL && styles.textRTL]}>
                      {ar(
                        'Choose a clear photo from your gallery to check safety ratings.',
                        'اختاري صورة واضحة من معرضك للتحقق من تصنيف السلامة.'
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Category Guide */}
              <View style={styles.catGuide}>
                <Text style={styles.catGuideRef}>
                  {ar('REFERENCE', 'مرجع')}
                </Text>
                <Text style={[styles.catGuideHeading, isRTL && styles.textRTL]}>
                  {ar('Medication Categories', 'تصنيفات الأدوية')}
                </Text>
                <Text style={[styles.catGuideSubtitle, isRTL && styles.textRTL]}>
                  {ar(
                    'Understanding the safety ratings established by global health authorities during pregnancy.',
                    'فهم تصنيفات السلامة المعتمدة من السلطات الصحية العالمية خلال الحمل.'
                  )}
                </Text>

                {/* Row 1: Category A (large) + B1/B2/B3 (compact row) */}
                <View style={[styles.catRow, isRTL && styles.rowRev]}>
                  {/* Category A — prominent card */}
                  <View style={styles.catCardA}>
                    <View style={[styles.catCardATop, isRTL && styles.rowRev]}>
                      <View style={[styles.catCircle, { backgroundColor: '#006a61' }]}>
                        <Text style={styles.catCircleLetter}>A</Text>
                      </View>
                      <Text style={styles.catCardALabel}>{ar('Safe to use', 'آمن للاستخدام')}</Text>
                    </View>
                    <Text style={[styles.catCardADesc, isRTL && styles.textRTL]}>
                      {ar(
                        'Controlled studies show no risk to the fetus in the first or later trimesters.',
                        'دراسات موثوقة تُثبت عدم وجود خطر على الجنين في أي مرحلة.'
                      )}
                    </Text>
                  </View>

                  {/* B1 / B2 / B3 compact cards */}
                  <View style={styles.catBGroup}>
                    {(
                      [
                        {
                          cat: 'B1',
                          label: ar('Low Risk', 'خطر منخفض'),
                          desc: ar('No evidence of harm in limited human studies.', 'لا دليل على الضرر في دراسات بشرية محدودة.'),
                        },
                        {
                          cat: 'B2',
                          label: ar('No Harm Seen', 'لا ضرر'),
                          desc: ar('Animal studies show no harm; human data limited.', 'دراسات الحيوانات لا تُظهر ضرراً.'),
                        },
                        {
                          cat: 'B3',
                          label: ar('Uncertain', 'غير مؤكد'),
                          desc: ar('Animal studies show harm, human data lacks.', 'دراسات الحيوانات تُظهر ضرراً محتملاً.'),
                        },
                      ] as Array<{ cat: string; label: string; desc: string }>
                    ).map(({ cat, label, desc }) => (
                      <View key={cat} style={styles.catCardB}>
                        <Text style={styles.catCardBLetter}>{cat}</Text>
                        <Text style={styles.catCardBLabel}>{label}</Text>
                        <Text style={styles.catCardBDesc}>{desc}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Row 2: C / D / X */}
                <View style={[styles.catRow, isRTL && styles.rowRev]}>
                  {(
                    [
                      {
                        cat: 'C',
                        color: '#825400',
                        bg: '#ffffff',
                        borderColor: '#825400',
                        label: ar('Caution', 'تحذير'),
                        desc: ar(
                          'May have harmful effects. Use only if benefits outweigh risks.',
                          'قد يكون ضاراً. استخدمي فقط إذا كانت الفوائد تفوق المخاطر.'
                        ),
                        labelColor: '#181c1c',
                      },
                      {
                        cat: 'D',
                        color: '#d35400',
                        bg: '#ffffff',
                        borderColor: '#d35400',
                        label: ar('High Risk', 'خطر عالٍ'),
                        desc: ar(
                          'Evidence of fetal risk. Used only in life-threatening emergencies.',
                          'دليل على خطر الجنين. يُستخدم فقط في حالات الطوارئ.'
                        ),
                        labelColor: '#181c1c',
                      },
                      {
                        cat: 'X',
                        color: '#ba1a1a',
                        bg: '#ffdad6',
                        borderColor: '#ba1a1a',
                        label: ar('Prohibited', 'محظور'),
                        desc: ar(
                          'Clear fetal risk. Risks clearly outweigh any benefit.',
                          'خطر جنيني واضح. المخاطر تفوق أي فائدة.'
                        ),
                        labelColor: '#ba1a1a',
                      },
                    ] as Array<{ cat: string; color: string; bg: string; borderColor: string; label: string; desc: string; labelColor: string }>
                  ).map(({ cat, color, bg, borderColor, label, desc, labelColor }) => (
                    <View
                      key={cat}
                      style={[styles.catCardCDX, { backgroundColor: bg, borderLeftColor: borderColor }]}
                    >
                      <View style={[styles.catCardATop, isRTL && styles.rowRev]}>
                        <View style={[styles.catCircle, { backgroundColor: color }]}>
                          <Text style={styles.catCircleLetter}>{cat}</Text>
                        </View>
                        <Text style={[styles.catCardALabel, { color: labelColor }]}>{label}</Text>
                      </View>
                      <Text style={[styles.catCardADesc, isRTL && styles.textRTL]}>{desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#006a61" />
              <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
                {appState === 'analyzing' ? t.analyzingImage : t.loading}
              </Text>
            </View>
          )}

          {/* ── RESULTS ──────────────────────────────────────────────────── */}
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

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeNavIndex;
          const label = language === 'ar' ? item.labelAr : item.label;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.7}
              onPress={isActive && isResults ? handleReset : undefined}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={isActive ? '#ffffff' : 'rgba(24,28,28,0.38)'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6faf9',
  },
  flex: { flex: 1 },
  rowRev: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(246,250,249,0.92)',
    // ambient shadow
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#006a61',
    letterSpacing: -0.5,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#f0f4f3',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#006a61',
  },

  // ── Scroll content ───────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 20,
  },

  // ── Hero section ─────────────────────────────────────────────────────────
  heroSection: {
    borderRadius: 40,
    backgroundColor: '#ebefee',
    minHeight: 300,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBlobTR: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#adefe7',
    opacity: 0.5,
  },
  heroBlobBL: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#006a61',
    opacity: 0.08,
  },
  heroInner: {
    width: '100%',
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 24,
    alignItems: 'center',
  },
  heroTagline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#181c1c',
    letterSpacing: -0.8,
    lineHeight: 44,
    textAlign: 'center',
  },
  heroAccent: {
    color: '#006a61',
  },

  // ── Action cards ─────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f0f4f3',
    borderRadius: 32,
    padding: 24,
    height: 220,
    justifyContent: 'space-between',
    // ambient shadow
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  actionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cameraIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(0,106,97,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(173,239,231,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardBottom: {
    gap: 6,
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#181c1c',
    letterSpacing: -0.3,
  },
  actionCardDesc: {
    fontSize: 12,
    color: '#3e4947',
    lineHeight: 18,
    fontWeight: '500',
  },

  // ── Category guide ───────────────────────────────────────────────────────
  catGuide: {
    gap: 16,
  },
  catGuideRef: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006a61',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  catGuideHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#181c1c',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  catGuideSubtitle: {
    fontSize: 14,
    color: '#3e4947',
    lineHeight: 22,
    fontWeight: '500',
    marginTop: -4,
  },
  catRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // Category A — full card (flex 1)
  catCardA: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 12,
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  catCardATop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  catCircleLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  catCardALabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#181c1c',
    flexShrink: 1,
  },
  catCardADesc: {
    fontSize: 13,
    color: '#3e4947',
    lineHeight: 20,
  },
  // B1/B2/B3 compact group (flex 2)
  catBGroup: {
    flex: 2,
    flexDirection: 'column',
    gap: 8,
  },
  catCardB: {
    flex: 1,
    backgroundColor: '#f0f4f3',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bdc9c6',
    gap: 2,
  },
  catCardBLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#256862',
  },
  catCardBLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3e4947',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  catCardBDesc: {
    fontSize: 10,
    color: '#6e7977',
    lineHeight: 14,
  },
  // C / D / X cards
  catCardCDX: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    gap: 10,
    borderLeftWidth: 4,
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingBox: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#006a61',
    fontWeight: '600',
  },

  // ── Bottom navigation ────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(246,250,249,0.95)',
    paddingTop: 10,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
    borderRadius: 9999,
  },
  navItemActive: {
    backgroundColor: '#006a61',
    width: 56,
    height: 56,
    borderRadius: 28,
    flex: 0,
    marginTop: -20,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  navLabel: {
    fontSize: 9,
    color: 'rgba(24,28,28,0.38)',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  navLabelActive: {
    color: '#ffffff',
    fontSize: 8,
  },
});
