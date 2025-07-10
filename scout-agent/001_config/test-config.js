module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '100_src/**/*.js',
    '300_lib/**/*.js',
    '!**/999_node_modules/**',
    '!**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/200_tests/**/*.test.js'
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/200_tests/test-setup.js']
};