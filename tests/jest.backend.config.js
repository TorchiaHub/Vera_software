/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Backend Tests',
  testEnvironment: 'node',
  roots: ['<rootDir>/backend'],
  testMatch: [
    '<rootDir>/backend/**/__tests__/**/*.{js,ts}',
    '<rootDir>/backend/**/*.(test|spec).{js,ts}'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '../backend/src/**/*.{ts,js}',
    '!../backend/src/**/*.d.ts',
    '!../backend/src/types/**/*',
    '!../backend/src/**/*.config.{ts,js}'
  ],
  coverageDirectory: '<rootDir>/coverage/backend',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testTimeout: 10000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../backend/src/$1',
    '^@backend/(.*)$': '<rootDir>/../backend/src/$1'
  },
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js'
};