export default {
    testEnvironment: 'node',
    testMatch: ['**/tests/integration/**/*.test.js'],
    setupFilesAfterEnv: ['./tests/integration/setup/jest.setup.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
      'routes/**/*.js',
      'db/**/*.js',
      'config/**/*.js'
    ],
    coverageDirectory: 'coverage-integration',
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000
  };