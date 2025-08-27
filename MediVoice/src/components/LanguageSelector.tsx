import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage, SupportedLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const LANGUAGES: { code: SupportedLanguage; label: string; translationKey: string }[] = [
  { code: 'en', label: 'English', translationKey: 'language_english' },
  { code: 'hi', label: 'हिन्दी', translationKey: 'language_hindi' },
  { code: 'te', label: 'తెలుగు', translationKey: 'language_telugu' },
  { code: 'ta', label: 'தமிழ்', translationKey: 'language_tamil' },
  { code: 'kn', label: 'ಕನ್ನಡ', translationKey: 'language_kannada' },
  { code: 'ml', label: 'മലയാളം', translationKey: 'language_malayalam' },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('select_language')}</Text>
      <View style={styles.buttonRow}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.button, language === lang.code && styles.selected]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={[styles.buttonText, language === lang.code && styles.selectedText]}>
              {t(lang.translationKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedText: {
    color: '#ffffff',
  },
});

export default LanguageSelector; 