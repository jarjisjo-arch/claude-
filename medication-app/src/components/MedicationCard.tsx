import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Medication, getCategoryColor, getCategoryBgColor } from '../services/database';
import { useLanguage } from '../context/LanguageContext';

interface MedicationCardProps {
  medication: Medication | null;
  recognizedName?: string;
  onReset: () => void;
}

export default function MedicationCard({ medication, recognizedName, onReset }: MedicationCardProps) {
  const { t, language, isRTL } = useLanguage();

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

  const name = language === 'ar' ? medication.nameAr : medication.nameEn;
  const description = language === 'ar' ? medication.descriptionAr : medication.descriptionEn;
  const warning = language === 'ar' ? medication.warningAr : medication.warningEn;
  const categoryColor = getCategoryColor(medication.pregnancyCategory);
  const categoryBg = getCategoryBgColor(medication.pregnancyCategory);

  return (
    <View style={styles.card}>
      {/* Medication name */}
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.nameSection}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t.medicationName}</Text>
          <Text style={[styles.medicationName, isRTL && styles.textRTL]}>{name}</Text>
          {recognizedName && recognizedName !== 'UNKNOWN' && language === 'ar' && (
            <Text style={[styles.latinName]}>{medication.nameEn}</Text>
          )}
        </View>
      </View>

      {/* Category badge */}
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

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>ℹ️ {t.medicationName}</Text>
        <Text style={[styles.descriptionText, isRTL && styles.textRTL]}>{description}</Text>
      </View>

      {/* Warning */}
      <View style={[styles.warningSection, isRTL && styles.warningSectionRTL]}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.warningTextContainer}>
          <Text style={[styles.warningSectionTitle, isRTL && styles.textRTL]}>{t.safetyNote}</Text>
          <Text style={[styles.warningText, isRTL && styles.textRTL]}>{warning}</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t.warning}</Text>

      {/* Reset button */}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.resetButtonText}>{t.searchAnother}</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    gap: 6,
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
  // Not found styles
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
