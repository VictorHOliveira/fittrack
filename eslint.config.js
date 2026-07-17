const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'node_modules/*']),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      // Lazy require() in firebase.ts singleton is intentional
      '@typescript-eslint/no-require-imports': 'off',
      // Navigation/router deps intentionally excluded to avoid re-render loops
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
