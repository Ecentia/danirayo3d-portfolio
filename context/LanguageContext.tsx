'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

type LanguageContextType = {
  language: Language;
  isSpanish: boolean;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Detect browser language on mount
    const userLang = navigator.language || (navigator as any).userLanguage || 'en';
    const isEs = userLang.startsWith('es');
    setLanguageState(isEs ? 'es' : 'en');
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const isSpanish = language === 'es';

  return (
    <LanguageContext.Provider value={{ language, isSpanish, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
