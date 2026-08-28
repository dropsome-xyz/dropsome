const path = require('path');
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // next-i18next v16 publishes dual .mjs/.cjs built with rolldown. Under
      // Next 14's webpack, resolving the `import` condition makes webpack
      // rewrite index.mjs's ESM imports as require("./appWithTranslation.mjs")
      // while emitting a CJS `exports` wrapper, so the client bundle gets
      // `exports is not defined` and every named export is undefined. The
      // plain-CJS entry is bundled correctly.
      config.resolve.alias['next-i18next/pages'] = path.resolve(
        __dirname,
        'node_modules/next-i18next/dist/pagesRouter/index.cjs',
      );
    }
    return config;
  },
};

module.exports = nextConfig;
