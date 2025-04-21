export default {
    testEnvironment: 'node',
    testMatch: ['**/test/integration/**/*.test.js'],
    setupFilesAfterEnv: ['./test/integration/setup/jest.setup.js'],
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