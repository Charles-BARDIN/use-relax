module.exports = {
  extends: [
    // /!\ Order matters
    'eslint:recommended',
    'airbnb',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin.
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier.
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],

  ignorePatterns: ['dist', 'node_modules'],

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  env: {
    browser: true,
    jest: true,
    es6: true,
  },

  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off', // In strict mode, (almost?) all return types are automatically infered.
    'import/extensions': 'off', // We don't want to specify `.ts` on all imports.
    'import/no-default-export': 'error', // We try to avoid default exports, to improve searchability and refactoring.
    'import/prefer-default-export': 'off', // We like named export as well.
  },
};
