'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LanguageCode } from '@/types';
import { dictionaries, TranslationDictionary } from './dictionaries';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  languageNames: { code: LanguageCode; label: string; native: string }[];
}

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmnexus_language') as LanguageCode;
      if (stored && dictionaries[stored]) {
        setLanguageState(stored);
      }
    } catch {
      // ignore in SSR
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (dictionaries[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem('farmnexus_language', lang);
      } catch {
        // ignore
      }
    }
  };

  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageNames: LANGUAGE_OPTIONS,
      }}
    >
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
