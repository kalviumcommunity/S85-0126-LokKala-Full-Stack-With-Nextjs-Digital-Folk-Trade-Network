import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/components/ui/Button.tsx",
    "src/utils/**/*.{js,jsx,ts,tsx}",
    "src/app/api/users/route.ts",
    "src/lib/responseHandler.ts",
    "src/lib/sanitize.ts",
    "src/lib/schemas/userSchema.ts",
    "!src/**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(customJestConfig);
