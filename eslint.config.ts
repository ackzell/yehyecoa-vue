import antfu from '@antfu/eslint-config';

export default antfu({
  type: 'lib',
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
  typescript: true,
  vue: true,
  jsonc: false,
  yaml: false,
  ignores: [
    '**/fixtures',
  ],
}, {
  // Additional config for more specific rules
  files: ['**/*.vue', '**/*.ts', '**/*.tsx', '**/*.js'],
  rules: {
    // TypeScript unused vars with underscore ignore pattern
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Vue template formatting
    'vue/max-attributes-per-line': [
      'warn', // Use 'warn' instead of 'error' for less strict enforcement
      {
        singleline: 3,
        multiline: 2,
      },
    ],
    'vue/first-attribute-linebreak': ['warn', {
      singleline: 'ignore',
      multiline: 'below',
    }],
    'vue/html-closing-bracket-newline': ['warn', {
      singleline: 'never',
      multiline: 'always',
    }],

    'vue/custom-event-name-casing': ['error', 'kebab-case'],
    'node/prefer-global/process': ['warn'],
    'no-console': ['warn'],
  },
});
