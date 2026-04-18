import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Medication,
  IngredientResult,
  getCategoryColor,
  getCategoryBgColor,
  getOverallCategory,
} from '../services/database';
import { useLanguage } from '../context/LanguageContext';
import { ADEC } from '../constants/adec';

// ── Color helpers ──────────────────────────────────────────────────────────
// Maps the design system's category colors exactly
function catBadgeColor(cat: string): string {
  const map: Record<string, string> = {
    A:  '#006a61',
    B1: '#256862',
    B2: '#256862',
    B3: '#256862',
    C:  '#825400',
    D:  '#d35400',
    X:  '#ba1a1a',
  };
  return map[cat] ?? '#6e7977';
}

function catBadgeBg(cat: string): string {
  const map: Record<string, string> = {
    A:  'rgba(0,106,97,0.1)',
    B1: 'rgba(37,104,98,0.1)',
    B2: 'rgba(37,104,98,0.1)',
    B3: 'rgba(37,104,98,0.1)',
    C:  'rgba(130,84,0,0.1)',
    D:  'rgba(211,84,0,0.1)',
    X:  '#ffdad6',
  };
  return map[cat] ?? '#f0f4f3';
}

// ── Props ──────────────────────────────────────────────────────────────────
interface MedicationCardProps {
  medication: Medication | null;
  recognizedName?: string;
  ingredientResults?: IngredientResult[];
  onReset: () => void;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MedicationCard({
  medication,
  recognizedName,
  ingredientResults,
  onReset,
}: MedicationCardProps) {
  const { t, language, isRTL } = useLanguage();

  const ar = (en: string, arStr: string) => language === 'ar' ? arStr : en;

  // Combination result (multi-ingredient image scan)
  if (ingredientResults && ingredientResults.length > 0) {
    return (
      <CombinationCard
        ingredientResults={ingredientResults}
        onReset={onReset}
        isRTL={isRTL}
        language={language}
        t={t}
        ar={ar}
      />
    );
  }

  // Not found
  if (!medication) {
    return (
      <View style={styles.notFoundCard}>
        <MaterialCommunityIcons name="magnify" size={64} color="#bdc9c6" style={styles.notFoundIcon} />
        <Text style={[styles.notFoundTitle, isRTL && styles.textRTL]}>{t.notFound}</Text>
        <Text style={[styles.notFoundDesc, isRTL && styles.textRTL]}>{t.notFoundDesc}</Text>
        {recognizedName && recognizedName !== 'UNKNOWN' && (
          <Text style={[styles.notFoundRecog, isRTL && styles.textRTL]}>
            {t.recognized} {recognizedName}
          </Text>
        )}
        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
          <MaterialCommunityIcons name="magnify" size={20} color="#ffffff" />
          <Text style={styles.resetBtnText}>{t.searchAnother}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Single medication result
  const name        = language === 'ar' ? medication.nameAr        : medication.nameEn;
  const description = language === 'ar' ? medication.descriptionAr : medication.descriptionEn;
  const warning     = language === 'ar' ? medication.warningAr     : medication.warningEn;
  const cat         = medication.pregnancyCategory;
  const badgeColor  = catBadgeColor(cat);
  const badgeBg     = catBadgeBg(cat);
  const catDesc     = t.categories[cat as keyof typeof t.categories] ?? cat;
  const adecDef     = ADEC[cat] ? (language === 'ar' ? ADEC[cat].ar : ADEC[cat].en) : '';

  return (
    <View style={styles.screen}>
      {/* Title block */}
      <View style={[styles.titleRow, isRTL && styles.rowRev]}>
        <View style={styles.titleIconBox}>
          <MaterialCommunityIcons name="pill" size={24} color="#ffffff" />
        </View>
        <View style={styles.titleText}>
          <Text style={[styles.titleMain, isRTL && styles.textRTL]}>{name}</Text>
          <Text style={[styles.titleSub, isRTL && styles.textRTL]}>
            {ar('Single Ingredient', 'مكوّن واحد')}
          </Text>
        </View>
      </View>

      {/* Overall Safety Card */}
      <View style={[styles.safetyCard, { backgroundColor: badgeBg }]}>
        <View style={[styles.safetyCardInner, isRTL && styles.safetyCardInnerRev]}>
          {/* Large pulsing badge */}
          <View style={styles.badgeWrap}>
            <View style={[styles.badgePulse, { backgroundColor: badgeColor + '30' }]} />
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeLetter}>{cat}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.safetyInfo}>
            <View style={[styles.safetyChip, { backgroundColor: badgeColor + '18' }]}>
              <Text style={[styles.safetyChipText, { color: badgeColor }]}>
                {ar('PREGNANCY CATEGORY', 'فئة الحمل')}
              </Text>
            </View>
            <Text style={[styles.safetyTitle, isRTL && styles.textRTL]}>
              {catDesc}
            </Text>
            <Text style={[styles.safetyBody, isRTL && styles.textRTL]}>{adecDef}</Text>
          </View>
        </View>

        {/* Decorative blur circle */}
        <View style={styles.decorBlob} pointerEvents="none" />
      </View>

      {/* Critical Medical Note */}
      <View style={styles.criticalNote}>
        <View style={[styles.criticalNoteHeader, isRTL && styles.rowRev]}>
          <View style={styles.warningIconBox}>
            <MaterialCommunityIcons name="alert" size={20} color="#ba1a1a" />
          </View>
          <View style={styles.criticalNoteText}>
            <Text style={styles.criticalNoteTitle}>
              {ar('Critical Medical Note', 'ملاحظة طبية مهمة')}
            </Text>
            <Text style={[styles.criticalNoteBody, isRTL && styles.textRTL]}>{warning}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      {/* Search Another button */}
      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="magnify" size={20} color="#ffffff" />
        <Text style={styles.resetBtnText}>{t.searchAnother}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Combination card ───────────────────────────────────────────────────────
interface CombinationCardProps {
  ingredientResults: IngredientResult[];
  onReset: () => void;
  isRTL: boolean;
  language: string;
  t: any;
  ar: (en: string, arStr: string) => string;
}

function CombinationCard({ ingredientResults, onReset, isRTL, language, t, ar }: CombinationCardProps) {
  const overallCat   = getOverallCategory(ingredientResults);
  const badgeColor   = overallCat ? catBadgeColor(overallCat) : '#6e7977';
  const badgeBg      = overallCat ? catBadgeBg(overallCat)    : '#f0f4f3';

  const worstIngredient = ingredientResults.find((r) => r.medication !== null);
  const worstWarning    = worstIngredient?.medication
    ? language === 'ar'
      ? worstIngredient.medication.warningAr
      : worstIngredient.medication.warningEn
    : null;

  const overallCatDesc = overallCat
    ? t.categories[overallCat as keyof typeof t.categories] ?? overallCat
    : ar('Not in database', 'غير موجود في قاعدة البيانات');
  const overallAdecDef = overallCat && ADEC[overallCat]
    ? (language === 'ar' ? ADEC[overallCat].ar : ADEC[overallCat].en)
    : '';

  return (
    <View style={styles.screen}>

      {/* Title block */}
      <View style={[styles.titleRow, isRTL && styles.rowRev]}>
        <View style={styles.titleIconBox}>
          <MaterialCommunityIcons name="pill" size={24} color="#ffffff" />
        </View>
        <View style={styles.titleText}>
          <Text style={[styles.titleMain, isRTL && styles.textRTL]}>
            {ar('Combination Medication', 'دواء مركب')}
          </Text>
          <Text style={[styles.titleSub, isRTL && styles.textRTL]}>
            {ar('Multiple Ingredient Analysis', 'تحليل المكونات المتعددة')}
          </Text>
        </View>
      </View>

      {/* Overall Safety Card */}
      <View style={[styles.safetyCard, { backgroundColor: badgeBg }]}>
        <View style={[styles.safetyCardInner, isRTL && styles.safetyCardInnerRev]}>
          {/* Large pulsing badge */}
          <View style={styles.badgeWrap}>
            <View style={[styles.badgePulse, { backgroundColor: badgeColor + '30' }]} />
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeLetter}>{overallCat ?? '?'}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.safetyInfo}>
            <View style={[styles.safetyChip, { backgroundColor: badgeColor + '18' }]}>
              <Text style={[styles.safetyChipText, { color: badgeColor }]}>
                {ar('OVERALL SAFETY CATEGORY', 'فئة السلامة الإجمالية')}
              </Text>
            </View>
            <Text style={[styles.safetyTitle, isRTL && styles.textRTL]}>
              {overallCatDesc}
            </Text>
            {overallAdecDef ? (
              <Text style={[styles.safetyBody, isRTL && styles.textRTL]}>{overallAdecDef}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.decorBlob} pointerEvents="none" />
      </View>

      {/* Active Ingredients */}
      <View style={styles.ingredientsSection}>
        <View style={[styles.ingredientsSectionHeader, isRTL && styles.rowRev]}>
          <Text style={[styles.ingredientsSectionTitle, isRTL && styles.textRTL]}>
            {ar('Active Ingredients', 'المكونات الفعّالة')}
          </Text>
          <Text style={styles.ingredientsCount}>
            {ingredientResults.length} {ar('Elements Found', 'عنصر')}
          </Text>
        </View>

        <View style={styles.ingredientsList}>
          {ingredientResults.map((item, index) => {
            const cat      = item.medication?.pregnancyCategory;
            const color    = cat ? catBadgeColor(cat)  : '#9ca3af';
            const bg       = cat ? catBadgeBg(cat)     : '#f3f4f6';
            const medName  = item.medication
              ? language === 'ar' ? item.medication.nameAr : item.medication.nameEn
              : item.names[0];
            const medType  = item.medication
              ? (language === 'ar' ? item.medication.descriptionAr : item.medication.descriptionEn)
                  .split('.')[0]
              : ar('Unknown substance', 'مادة غير معروفة');

            return (
              <View key={index} style={[styles.ingredientRow, isRTL && styles.rowRev]}>
                {/* Science icon */}
                <View style={[styles.ingredientIconBox, { backgroundColor: '#ffffff' }]}>
                  <MaterialCommunityIcons name="flask" size={20} color={color} />
                </View>

                {/* Name + type */}
                <View style={styles.ingredientInfo}>
                  <Text style={[styles.ingredientName, isRTL && styles.textRTL]}>{medName}</Text>
                  <Text style={[styles.ingredientType, isRTL && styles.textRTL]} numberOfLines={1}>
                    {medType}
                  </Text>
                </View>

                {/* Category badge pill */}
                <View style={[styles.ingredientCatBadge, { backgroundColor: color }]}>
                  <Text style={styles.ingredientCatBadgeText}>{cat ?? '?'}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Critical Medical Note */}
      {worstWarning && (
        <View style={styles.criticalNote}>
          <View style={[styles.criticalNoteHeader, isRTL && styles.rowRev]}>
            <View style={styles.warningIconBox}>
              <MaterialCommunityIcons name="alert" size={20} color="#ba1a1a" />
            </View>
            <View style={styles.criticalNoteText}>
              <Text style={styles.criticalNoteTitle}>
                {ar('Critical Medical Note', 'ملاحظة طبية مهمة')}
              </Text>
              <Text style={[styles.criticalNoteBody, isRTL && styles.textRTL]}>{worstWarning}</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      {/* Search Another button */}
      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="magnify" size={20} color="#ffffff" />
        <Text style={styles.resetBtnText}>{t.searchAnother}</Text>
      </TouchableOpacity>

    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  rowRev: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },

  // ── Title row ──────────────────────────────────────────────────────────
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  titleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#14857a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: '800',
    color: '#181c1c',
    letterSpacing: -0.5,
  },
  titleSub: {
    fontSize: 14,
    color: '#3e4947',
    fontWeight: '500',
  },

  // ── Overall safety card ────────────────────────────────────────────────
  safetyCard: {
    borderRadius: 32,
    padding: 28,
    overflow: 'hidden',
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  safetyCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  safetyCardInnerRev: {
    flexDirection: 'row-reverse',
  },
  badgeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    flexShrink: 0,
  },
  badgePulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeLetter: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  safetyInfo: {
    flex: 1,
    gap: 8,
  },
  safetyChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  safetyChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181c1c',
    lineHeight: 24,
  },
  safetyBody: {
    fontSize: 13,
    color: '#3e4947',
    lineHeight: 20,
  },
  decorBlob: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ── Ingredients ────────────────────────────────────────────────────────
  ingredientsSection: {
    gap: 16,
  },
  ingredientsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ingredientsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#181c1c',
  },
  ingredientsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#006a61',
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f0f4f3',
    borderRadius: 24,
    padding: 16,
  },
  ingredientIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientInfo: {
    flex: 1,
    gap: 2,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181c1c',
  },
  ingredientType: {
    fontSize: 12,
    color: '#3e4947',
  },
  ingredientCatBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ingredientCatBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  // ── Critical Medical Note ──────────────────────────────────────────────
  criticalNote: {
    backgroundColor: 'rgba(186,26,26,0.07)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.07)',
  },
  criticalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  warningIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(186,26,26,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  criticalNoteText: {
    flex: 1,
    gap: 4,
  },
  criticalNoteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ba1a1a',
  },
  criticalNoteBody: {
    fontSize: 13,
    color: '#3e4947',
    lineHeight: 20,
  },

  // ── Not found ──────────────────────────────────────────────────────────
  notFoundCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#181c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  notFoundIcon: {
    marginBottom: 8,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#181c1c',
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 14,
    color: '#3e4947',
    textAlign: 'center',
    lineHeight: 22,
  },
  notFoundRecog: {
    fontSize: 13,
    color: '#006a61',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── Disclaimer ─────────────────────────────────────────────────────────
  disclaimer: {
    fontSize: 12,
    color: '#6e7977',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // ── Reset button ───────────────────────────────────────────────────────
  resetBtn: {
    backgroundColor: '#006a61',
    borderRadius: 9999,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
