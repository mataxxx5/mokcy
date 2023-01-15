module.exports = {
  env: {
    browser: true,
    webextensions: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    'plugin:react/recommended',
  ],
  overrides: [
    {
      files: ["*.d.ts"],
      rules: {
          "no-undef": "off"
      }
    }
  ],
  plugins: [
    '@typescript-eslint',
    'react'
  ],
  root: true,
  parserOptions: {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": [
      './tsconfig.json',
    ],
    "ecmaFeatures": {
      "jsx": true
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-floating-promises': 'off'
  }
}
