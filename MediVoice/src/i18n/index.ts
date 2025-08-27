import { I18n } from 'i18n-js';
import en from './en';
import hi from './hi';

// Create i18n instance
const i18n = new I18n({
  en,
  hi,
});

// Set default locale
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

// Function to change locale
export const setLocale = (locale: string) => {
  i18n.locale = locale;
};

// Function to get current locale
export const getLocale = () => {
  return i18n.locale;
};

// Function to translate text
export const t = (key: string, params?: any) => {
  return i18n.t(key, params);
};

export default i18n; 