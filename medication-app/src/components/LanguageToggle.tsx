import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.container} activeOpacity={0.7}>
      <View style={[styles.option, language === 'en' && styles.activeOption]}>
        <Text style={[styles.optionText, language === 'en' && styles.activeText]}>EN</Text>
      </View>
      <View style={[styles.option, language === 'ar' && styles.activeOption]}>
        <Text style={[styles.optionText, language === 'ar' && styles.activeText]}>ع</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 3,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeOption: {
    backgroundColor: '#ffffff',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  activeText: {
    color: '#0f766e',
  },
});
