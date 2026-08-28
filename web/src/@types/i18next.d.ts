import type common from '../i18n/locales/en/common.json';
import type drop from '../i18n/locales/en/drop.json';
import type claim from '../i18n/locales/en/claim.json';
import type refund from '../i18n/locales/en/refund.json';
import type errors from '../i18n/locales/en/errors.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      drop: typeof drop;
      claim: typeof claim;
      refund: typeof refund;
      errors: typeof errors;
    };
  }
}
