import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    rules: {
      // PROJECT_SPEC §5.A: strict typing and small functions.
      '@typescript-eslint/no-explicit-any': 'error',
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
);
