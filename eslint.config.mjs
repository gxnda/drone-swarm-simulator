// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['**/*.{js,ts}'],
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  rules: {
    // Turn off the core rule (TypeScript rule supersedes it)
    'no-unused-vars': 'off',

        // Configure the TypeScript rule with underscore ignore
        '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
});
