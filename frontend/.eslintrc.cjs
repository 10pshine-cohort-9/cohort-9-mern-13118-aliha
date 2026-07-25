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
    // Off, deliberately: this project isn't using PropTypes or TypeScript
    // for prop validation (a call made for a 4-sprint scope, not an
    // oversight). Revisit if the component tree grows complex enough
    // that untyped props become a real bug source — at that point,
    // TypeScript is the better fix, not retrofitting PropTypes.
    'react/prop-types': 'off',
    // New JSX transform (React 17+, used here via Vite) doesn't require
    // `import React` in every file that uses JSX.
    'react/react-in-jsx-scope': 'off',
  },
};
