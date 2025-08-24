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
  jsonc: true,
  yaml: true,
  ignores: [
    '**/fixtures',
  ],
}, {
  // Additional config for more specific rules
  files: ['**/*.ts', '**/*.vue', '**/*.tsx', '**/*.js'],
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
        singleline: 4,
        multiline: 4,
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

    'perfectionist/sort-imports': [
      'error',
      {
        type: 'line-length',
        order: 'desc',
        groups: [
          'side-effect', // CSS imports first
          'builtin',
          'external',
          'internal-type',
          'internal',
          ['parent-type', 'sibling-type', 'index-type'],
          ['parent', 'sibling', 'index'],
          'object',
          'unknown',
        ],
      },
    ],

    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

    'style/object-curly-newline': ['error', {
      ImportDeclaration: {
        multiline: true,
        minProperties: 3,
      },

    }],
  },
}, {
  files: ['**/*.vue'],
  rules: {
    // ... your other rules

    // Catch undefined components
    'vue/no-undef-components': ['error', {
      ignorePatterns: ['router-link', 'router-view'], // Ignore global components
    }],
  },
});
