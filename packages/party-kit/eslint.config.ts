import antfu from '@antfu/eslint-config';

export default antfu({
  type: 'lib',
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
  typescript: true,
  vue: false, // party-kit doesn't use Vue
  jsonc: true,
  yaml: true,
  ignores: [
    '**/fixtures',
    '**/dist',
    '**/node_modules',
  ],
}, {
  // Match yehyecoa-vue rules for consistency
  files: ['**/*.ts', '**/*.js'],
  rules: {
    // TypeScript unused vars with underscore ignore pattern
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    'node/prefer-global/process': ['warn'],
    'no-console': ['warn'],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  },
});
