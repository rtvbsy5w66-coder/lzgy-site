// jest.config.mjs
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/test/utils/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "<rootDir>/test/unit/**/*.test.{ts,tsx,js,jsx}",
    "<rootDir>/test/integration/**/*.test.{ts,tsx,js,jsx}",
    "<rootDir>/test/security/**/*.test.{ts,tsx,js,jsx}",
    "<rootDir>/src/**/*.test.{ts,tsx,js,jsx}"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/test/fixtures/",
    "<rootDir>/test/e2e/",
    "<rootDir>/test/scripts/",
    "<rootDir>/node_modules/"
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
