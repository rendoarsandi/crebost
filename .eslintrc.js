module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "next/core-web-vitals"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "*.config.js"
  ]
};
