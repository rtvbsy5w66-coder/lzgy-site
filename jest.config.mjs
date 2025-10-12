// jest.config.mjs
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "<rootDir>/__tests__/**/*.test.{ts,tsx,js,jsx}",
    "<rootDir>/src/**/*.test.{ts,tsx,js,jsx}"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/__tests__/__mocks__/",
    "<rootDir>/__tests__/e2e/",
    "<rootDir>/admin-auth.test.ts"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        jsx: "react-jsx",
      },
    }],
    "^.+\\.(js|jsx)$": ["ts-jest", {
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid|next)/)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
};

export default createJestConfig(customJestConfig);
