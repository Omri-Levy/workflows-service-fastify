module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  testRegex: "(/__tests__/.*|(\\.|/)(unit|e2e|intg)\\.test)\\.ts$",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: "./tsconfig.test.json"
      }
    ]
  },
  globalSetup: "<rootDir>/src/test/db-setup.ts",
  globalTeardown: "<rootDir>/src/test/db-teardown.ts"
};
