const path = require('path');

module.exports = {
  // Consumed by next.config.js — this is Next's own i18n routing block.
  i18n: {
    locales: ['en', 'ru', 'be', 'uk', 'es', 'pt'],
    defaultLocale: 'en',
    // localeDetection is ON by default (nextConfig.i18n.localeDetection !== false).
    // Explicit `true` is rejected by Next 14's zod schema; omit for silence.
  },
  // v16 top-level config keys (supportedLngs + fallbackLng are both required).
  supportedLngs: ['en', 'ru', 'be', 'uk', 'es', 'pt'],
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
