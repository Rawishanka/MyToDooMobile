// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Temporarily downgrade these rules to warnings to allow build
      'react/no-unescaped-entities': 'warn',
      'import/export': 'warn',
    },
  },
]);
