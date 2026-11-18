import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
    rules: {
      // PROJECT_SPEC §5.A: strict typing and small functions.
      '@typescript-eslint/no-explicit-any': 'error',
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      // Express detects error handlers by arity, so `_next` must exist even if unused.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
