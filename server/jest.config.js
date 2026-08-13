module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'utils/calculations.js',
    'utils/cache.js',
    'middleware/auth.js',
    '!**/node_modules/**',
  ],
};
