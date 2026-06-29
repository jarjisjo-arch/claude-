import React, { createContext, useContext, useState } from 'react';
import { I18nManager } from 'react-native';
import { Language, translations } from '../i18n/translations';

// Reset any persisted RTL state — we control RTL via explicit isRTL styles.
// This runs at module load time so a fresh APK install starts in LTR.
I18nManager.forceRTL(false);

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: typeof translations.en;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: translations.en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    // RTL is handled entirely via our isRTL flag in styles.
    // forceRTL is intentionally not called here to avoid layout conflicts.
  };

  const isRTL = language === 'ar';
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
