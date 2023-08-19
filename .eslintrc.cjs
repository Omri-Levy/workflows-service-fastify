// const config = require("../../packages/config/eslintrc.base.cjs");

module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports"],
  extends: [
    "plugin:import/recommended",
    "plugin:import/typescript",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json"
  },
  env: {
    node: true
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json"
      },
      node: true
    }
  },
  rules: {
    "no-unused-vars": "off", // We use the unused-imports plugin instead
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": ["warn", { vars: "all", args: "after-used" }],
    "import/no-cycle": "error",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/ban-ts-comment": "off"
  },
  ignorePatterns: [".eslintrc.cjs"]
};
