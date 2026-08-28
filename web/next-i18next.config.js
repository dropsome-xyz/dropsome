const path = require('path');

module.exports = {
  i18n: {
    locales: ['en', 'be', 'de', 'es', 'fr', 'id', 'ja', 'ko', 'pl', 'pt', 'ru', 'uk', 'vi', 'zh'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  // v16 top-level config keys (supportedLngs + fallbackLng are both required).
    supportedLngs: ['en', 'be', 'de', 'es', 'fr', 'id', 'ja', 'ko', 'pl', 'pt', 'ru', 'uk', 'vi', 'zh'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'drop', 'claim', 'refund', 'errors'],
  nonExplicitSupportedLngs: true,
  localePath: path.resolve('./src/i18n/locales'),
  localeStructure: '{{lng}}/{{ns}}',
  localeExtension: 'json',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  // Raw i18next init options go here in v16, not at top level.
  i18nextOptions: {
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  },
};
