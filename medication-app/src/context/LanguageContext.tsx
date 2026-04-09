import React, { createContext, useContext, useState } from 'react';
import { I18nManager } from 'react-native';
import { Language, translations } from '../i18n/translations';

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
    // Note: RTL layout changes fully take effect after app restart in native,
    // but text alignment and direction are handled inline via isRTL flag.
    I18nManager.forceRTL(next === 'ar');
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
