// Jest setup file for backend tests

// Set test timeout
jest.setTimeout(10000);

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error // Keep error for debugging
};

// Global test helpers
global.testHelpers = {
  createTestUser: async () => {
    // Helper to create test user
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date()
    };
  },
  
  createTestEnergyData: () => {
    return {
      deviceId: 'test-device-123',
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: {
          usage: 45.2,
          temperature: 65.0,
          frequency: 2400,
          cores: 8,
          threads: 16
        },
        memory: {
          total: 16384,
          used: 8192,
          available: 8192,
          cached: 2048
        },
        disk: {
          read: 100.5,
          write: 50.2,
          usage: 75.0
        }
      },
      powerConsumption: 125.5
    };
  }
};

// Clean up after each test
afterEach(async () => {
  // Clear any test data
  // This would typically clean up test database records
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});