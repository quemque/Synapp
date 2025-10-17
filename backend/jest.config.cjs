module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!**/node_modules/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
  transformIgnorePatterns: ["node_modules/(?!(mongodb-memory-server)/)"],
  moduleNameMapping: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/__tests__/setup.js",
    "/src/__tests__/models/User.test.js",
    "/src/__tests__/routes/auth.test.js",
    "/src/__tests__/routes/tasks.test.js",
    "/src/__tests__/routes/activities.test.js",
  ],
};
