import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

import trExtend from './locales/tr.extend.json';
import enExtend from './locales/en.extend.json';
import arExtend from './locales/ar.extend.json';

// Çevirileri birleştir
const trMerged = { ...trTranslation, ...trExtend };
const enMerged = { ...enTranslation, ...enExtend };
const arMerged = { ...arTranslation, ...arExtend };

export const availableLanguages = [
  { 
    code: 'tr', 
    name: 'Türkçe',
    nativeName: 'Türkçe',
    direction: 'ltr'
  },
  { 
    code: 'en', 
    name: 'English',
    nativeName: 'English',
    direction: 'ltr'
  },
  { 
    code: 'ar', 
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl'
  }
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: trMerged
      },
      en: {
        translation: enMerged
      },
      ar: {
        translation: arMerged
      }
    },
    fallbackLng: 'tr',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;