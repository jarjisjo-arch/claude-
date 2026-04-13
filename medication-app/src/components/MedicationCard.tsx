import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Medication,
  IngredientResult,
  getCategoryColor,
  getCategoryBgColor,
  getOverallCategory,
  CATEGORY_RANK,
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

  // ── Combination result (image scan with multiple ingredients) ──
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

  // ── Not found ──
  if (!medication) {
    return (
      <View style={styles.notFoundCard}>
        <Text style={styles.notFoundIcon}>🔍</Text>
        <Text style={[styles.notFoundTitle, isRTL && styles.textRTL]}>{t.notFound}</Text>
        <Text style={[styles.notFoundDesc, isRTL && styles.textRTL]}>{t.notFoundDesc}</Text>
        {recognizedName && recognizedName !== 'UNKNOWN' && (
          <Text style={[styles.recognizedText, isRTL && styles.textRTL]}>
            {t.recognized} {recognizedName}
          </Text>
        )}
        <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>{t.searchAnother}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Single medication ──
  const name = language === 'ar' ? medication.nameAr : medication.nameEn;
  const description = language === 'ar' ? medication.descriptionAr : medication.descriptionEn;
  const warning = language === 'ar' ? medication.warningAr : medication.warningEn;
  const categoryColor = getCategoryColor(medication.pregnancyCategory);
  const categoryBg = getCategoryBgColor(medication.pregnancyCategory);

  return (
    <View style={styles.card}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.nameSection}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t.medicationName}</Text>
          <Text style={[styles.medicationName, isRTL && styles.textRTL]}>{name}</Text>
          {recognizedName && recognizedName !== 'UNKNOWN' && language === 'ar' && (
            <Text style={styles.latinName}>{medication.nameEn}</Text>
          )}
        </View>
      </View>

      <View style={[styles.categorySection, { backgroundColor: categoryBg }]}>
        <Text style={[styles.categoryLabel, isRTL && styles.textRTL]}>
          {t.pregnancyCategoryLabel}
        </Text>
        <View style={[styles.badge, { backgroundColor: categoryColor }]}>
          <Text style={styles.badgeText}>{medication.pregnancyCategory}</Text>
        </View>
        <Text style={[styles.categoryDescription, { color: categoryColor }, isRTL && styles.textRTL]}>
          {t.categories[medication.pregnancyCategory as keyof typeof t.categories] ??
            medication.pregnancyCategory}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>ℹ️ {t.medicationName}</Text>
        <Text style={[styles.descriptionText, isRTL && styles.textRTL]}>{description}</Text>
      </View>

      <View style={[styles.warningSection, isRTL && styles.warningSectionRTL]}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.warningTextContainer}>
          <Text style={[styles.warningSectionTitle, isRTL && styles.textRTL]}>{t.safetyNote}</Text>
          <Text style={[styles.warningText, isRTL && styles.textRTL]}>{warning}</Text>
        </View>
      </View>

      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.resetButtonText}>{t.searchAnother}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Combination card — shown when image contains multiple active ingredients
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

  // Find the most dangerous ingredient for its warning text
  const worstIngredient = ingredientResults.find((r) => r.medication !== null);
  const worstWarning = worstIngredient?.medication
    ? language === 'ar'
      ? worstIngredient.medication.warningAr
      : worstIngredient.medication.warningEn
    : null;

  const isCombination = language === 'ar' ? 'دواء مركب' : 'Combination Medication';
  const overallLabel = language === 'ar' ? 'فئة السلامة الإجمالية' : 'Overall Safety Category';
  const ingredientsLabel = language === 'ar' ? 'المكونات الفعّالة' : 'Active Ingredients';
  const notInDb = language === 'ar' ? 'غير موجود في قاعدة البيانات' : 'Not in database';

  return (
    <View style={styles.card}>
      {/* Combination label */}
      <View style={[styles.combinationHeader, isRTL && styles.rowRTL]}>
        <Text style={styles.combinationIcon}>💊</Text>
        <Text style={[styles.combinationTitle, isRTL && styles.textRTL]}>{isCombination}</Text>
      </View>

      {/* Overall category */}
      <View style={[styles.categorySection, { backgroundColor: overallBg }]}>
        <Text style={[styles.categoryLabel, isRTL && styles.textRTL]}>{overallLabel}</Text>
        {overallCategory ? (
          <>
            <View style={[styles.badge, { backgroundColor: overallColor }]}>
              <Text style={styles.badgeText}>{overallCategory}</Text>
            </View>
            <Text style={[styles.categoryDescription, { color: overallColor }, isRTL && styles.textRTL]}>
              {t.categories[overallCategory as keyof typeof t.categories] ?? overallCategory}
            </Text>
          </>
        ) : (
          <Text style={[styles.categoryDescription, { color: '#6b7280' }, isRTL && styles.textRTL]}>
            {notInDb}
          </Text>
        )}
      </View>

      {/* Ingredients breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          🧪 {ingredientsLabel} ({ingredientResults.length})
        </Text>
        <View style={styles.ingredientsList}>
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
                style={[styles.ingredientRow, { backgroundColor: bg }, isRTL && styles.ingredientRowRTL]}
              >
                {/* Category badge */}
                <View style={[styles.smallBadge, { backgroundColor: color }]}>
                  <Text style={styles.smallBadgeText}>{cat ?? '?'}</Text>
                </View>

                {/* Name + category description */}
                <View style={styles.ingredientInfo}>
                  <Text style={[styles.ingredientName, { color: '#0f172a' }, isRTL && styles.textRTL]}>
                    {medName}
                  </Text>
                  <Text style={[styles.ingredientCatDesc, { color }, isRTL && styles.textRTL]}>
                    {catDesc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Warning from worst ingredient */}
      {worstWarning && (
        <View style={[styles.warningSection, isRTL && styles.warningSectionRTL]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningTextContainer}>
            <Text style={[styles.warningSectionTitle, isRTL && styles.textRTL]}>{t.safetyNote}</Text>
            <Text style={[styles.warningText, isRTL && styles.textRTL]}>{worstWarning}</Text>
          </View>
        </View>
      )}

      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.resetButtonText}>{t.searchAnother}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  nameSection: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medicationName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  latinName: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  categorySection: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 50,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  categoryDescription: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  warningSection: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  warningSectionRTL: {
    flexDirection: 'row-reverse',
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderRightColor: '#f97316',
  },
  warningIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  warningTextContainer: {
    flex: 1,
    gap: 3,
  },
  warningSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9a3412',
    textTransform: 'uppercase',
  },
  warningText: {
    fontSize: 13,
    color: '#7c2d12',
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  // Combination-specific
  combinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  combinationIcon: {
    fontSize: 20,
  },
  combinationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  ingredientRowRTL: {
    flexDirection: 'row-reverse',
  },
  smallBadge: {
    width: 40,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBadgeText: {
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
  },
  ingredientCatDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Not found
  notFoundCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  recognizedText: {
    fontSize: 13,
    color: '#0f766e',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
