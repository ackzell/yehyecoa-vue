import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    files: ['**/*.ts', '**/*.tsx'], // Add support for TypeScript files
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // optional, but recommended for type-aware linting
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.vue'], // Keep your Vue config too
    languageOptions: {
      parserOptions: {
        parser: {
          'ts': '@typescript-eslint/parser',
          '<template>': 'espree',
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]);
