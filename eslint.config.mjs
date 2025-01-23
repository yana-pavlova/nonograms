import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Глобальные переменные для браузера (document, localStorage и т.д.)
        ...globals.node, // Глобальные переменные для Node.js (require, module, __dirname)
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      'prettier/prettier': 'error', // Включение правил Prettier
    },
    ignores: [
      'node_modules/*', // Игнорирование папки node_modules
      'dist/*', // Игнорирование папки dist
    ],
  },
];
