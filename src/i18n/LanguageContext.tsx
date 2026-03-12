import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Language } from '../types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (translations: Record<Language, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const t = useCallback(
    (translations: Record<Language, string>) => translations[language],
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
