module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'no-unused-vars': 'warn',
    // New JSX transform (React 17+, used here via Vite) doesn't require
    // `import React` in every file that uses JSX.
    'react/react-in-jsx-scope': 'off',
  },
};
