import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Medication,
  IngredientResult,
  getCategoryColor,
  getCategoryBgColor,
  getOverallCategory,
} from '../services/database';
import { useLanguage } from '../context/LanguageContext';

interface MedicationCardProps {
  medication: Medication | null;
  recognizedName?: string;
  ingredientResults?: IngredientResult[];
  onReset: () => void;
}

export default function MedicationCard({
  medication,
  recognizedName,
  ingredientResults,
  onReset,
}: MedicationCardProps) {
  const { t, language, isRTL } = useLanguage();

  // Combination result (image scan with multiple ingredients)
  if (ingredientResults && ingredientResults.length > 0) {
    return (
      <CombinationCard
        ingredientResults={ingredientResults}
        onReset={onReset}
        isRTL={isRTL}
        language={language}
        t={t}
      />
    );
  }

  // Not found
  if (!medication) {
    return (
      <View style={styles.card}>
        <View style={styles.notFoundCenter}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={[styles.notFoundTitle, isRTL && styles.textRTL]}>{t.notFound}</Text>
          <Text style={[styles.notFoundDesc, isRTL && styles.textRTL]}>{t.notFoundDesc}</Text>
          {recognizedName && recognizedName !== 'UNKNOWN' && (
            <Text style={[styles.recognizedText, isRTL && styles.textRTL]}>
              {t.recognized} {recognizedName}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>{t.searchAnother}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Single medication result
  const name = language === 'ar' ? medication.nameAr : medication.nameEn;
  const description = language === 'ar' ? medication.descriptionAr : medication.descriptionEn;
  const warning = language === 'ar' ? medication.warningAr : medication.warningEn;
  const catCol = getCategoryColor(medication.pregnancyCategory);
  const catBg = getCategoryBgColor(medication.pregnancyCategory);
  const catDesc = t.categories[medication.pregnancyCategory as keyof typeof t.categories] ?? medication.pregnancyCategory;

  return (
    <View style={styles.card}>
      {/* Large category circle */}
      <View style={styles.categoryCenter}>
        <Text style={[styles.categoryOverallLabel, isRTL && styles.textRTL]}>
          {t.pregnancyCategoryLabel}
        </Text>
        <View style={[styles.categoryCircle, { backgroundColor: catBg }]}>
          <Text style={[styles.categoryCircleText, { color: catCol }]}>
            {medication.pregnancyCategory}
          </Text>
        </View>
        <Text style={[styles.categoryDesc, { color: catCol }, isRTL && styles.textRTL]}>
          {catDesc}
        </Text>
      </View>

      {/* Medication name */}
      <View style={styles.nameBlock}>
        <Text style={[styles.medName, isRTL && styles.textRTL]}>{name}</Text>
        {language === 'ar' && (
          <Text style={styles.latinName}>{medication.nameEn}</Text>
        )}
      </View>

      {/* Description with tonal background */}
      <View style={[styles.descBlock, { backgroundColor: catBg }]}>
        <Text style={[styles.descText, isRTL && styles.textRTL]}>{description}</Text>
      </View>

      {/* Critical Medical Note */}
      <View style={styles.warningBlock}>
        <View style={[styles.warningHeader, isRTL && styles.rowReverse]}>
          <Text style={styles.warningEmoji}>⚠️</Text>
          <Text style={styles.warningTitle}>
            {language === 'ar' ? 'ملاحظة طبية مهمة' : 'Critical Medical Note'}
          </Text>
        </View>
        <Text style={[styles.warningText, isRTL && styles.textRTL]}>{warning}</Text>
      </View>

      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
        <Text style={styles.resetBtnText}>{t.searchAnother}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Combination card — image scan with multiple active ingredients
// ─────────────────────────────────────────────────────────────────────────────

interface CombinationCardProps {
  ingredientResults: IngredientResult[];
  onReset: () => void;
  isRTL: boolean;
  language: string;
  t: any;
}

function CombinationCard({ ingredientResults, onReset, isRTL, language, t }: CombinationCardProps) {
  const overallCategory = getOverallCategory(ingredientResults);
  const overallColor = overallCategory ? getCategoryColor(overallCategory) : '#6b7280';
  const overallBg = overallCategory ? getCategoryBgColor(overallCategory) : '#f3f4f6';

  const worstIngredient = ingredientResults.find((r) => r.medication !== null);
  const worstWarning = worstIngredient?.medication
    ? language === 'ar'
      ? worstIngredient.medication.warningAr
      : worstIngredient.medication.warningEn
    : null;

  const overallLabel = language === 'ar' ? 'فئة السلامة الإجمالية' : 'OVERALL SAFETY CATEGORY';
  const ingredientsLabel = language === 'ar' ? 'المكونات الفعّالة' : 'Active Ingredients';
  const notInDb = language === 'ar' ? 'غير موجود في قاعدة البيانات' : 'Not in database';
  const criticalNote = language === 'ar' ? 'ملاحظة طبية مهمة' : 'Critical Medical Note';

  return (
    <View style={styles.card}>
      {/* Overall category circle */}
      <View style={styles.categoryCenter}>
        <Text style={[styles.categoryOverallLabel, isRTL && styles.textRTL]}>{overallLabel}</Text>
        {overallCategory ? (
          <>
            <View style={[styles.categoryCircle, { backgroundColor: overallBg }]}>
              <Text style={[styles.categoryCircleText, { color: overallColor }]}>
                {overallCategory}
              </Text>
            </View>
            <Text style={[styles.categoryDesc, { color: overallColor }, isRTL && styles.textRTL]}>
              {t.categories[overallCategory as keyof typeof t.categories] ?? overallCategory}
            </Text>
          </>
        ) : (
          <View style={[styles.categoryCircle, { backgroundColor: '#f3f4f6' }]}>
            <Text style={[styles.categoryCircleText, { color: '#6b7280' }]}>?</Text>
          </View>
        )}
      </View>

      {/* Ingredients breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
          {ingredientsLabel} ({ingredientResults.length})
        </Text>
        <View style={styles.ingredientList}>
          {ingredientResults.map((item, index) => {
            const cat = item.medication?.pregnancyCategory;
            const color = cat ? getCategoryColor(cat) : '#9ca3af';
            const bg = cat ? getCategoryBgColor(cat) : '#f3f4f6';
            const medName = item.medication
              ? language === 'ar'
                ? item.medication.nameAr
                : item.medication.nameEn
              : item.names[0];
            const catDesc = cat
              ? t.categories[cat as keyof typeof t.categories] ?? cat
              : notInDb;

            return (
              <View
                key={index}
                style={[styles.ingredientItem, { backgroundColor: bg }, isRTL && styles.rowReverse]}
              >
                <View style={[styles.ingredientBadge, { backgroundColor: color }]}>
                  <Text style={styles.ingredientBadgeText}>{cat ?? '?'}</Text>
                </View>
                <View style={styles.ingredientInfo}>
                  <Text style={[styles.ingredientName, isRTL && styles.textRTL]}>{medName}</Text>
                  <Text style={[styles.ingredientCat, { color }, isRTL && styles.textRTL]}>
                    {catDesc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Critical medical note from worst ingredient */}
      {worstWarning && (
        <View style={styles.warningBlock}>
          <View style={[styles.warningHeader, isRTL && styles.rowReverse]}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.warningTitle}>{criticalNote}</Text>
          </View>
          <Text style={[styles.warningText, isRTL && styles.textRTL]}>{worstWarning}</Text>
        </View>
      )}

      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
        <Text style={styles.resetBtnText}>{t.searchAnother}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#006a61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  // Category circle
  categoryCenter: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  categoryOverallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b6b68',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  categoryCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCircleText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  categoryDesc: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Name block
  nameBlock: {
    gap: 2,
  },
  medName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#181c1c',
  },
  latinName: {
    fontSize: 13,
    color: '#4b6b68',
    fontStyle: 'italic',
  },
  // Description
  descBlock: {
    borderRadius: 14,
    padding: 14,
  },
  descText: {
    fontSize: 14,
    color: '#181c1c',
    lineHeight: 22,
  },
  // Warning
  warningBlock: {
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  warningEmoji: {
    fontSize: 16,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9a3412',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 13,
    color: '#7c2d12',
    lineHeight: 20,
  },
  // Ingredients section
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b6b68',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ingredientList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  ingredientBadge: {
    width: 40,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  ingredientInfo: {
    flex: 1,
    gap: 2,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181c1c',
  },
  ingredientCat: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Not found state
  notFoundCenter: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#181c1c',
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 14,
    color: '#4b6b68',
    textAlign: 'center',
    lineHeight: 20,
  },
  recognizedText: {
    fontSize: 13,
    color: '#006a61',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Disclaimer
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // Reset / Search Another button — full-width teal pill
  resetBtn: {
    backgroundColor: '#006a61',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
