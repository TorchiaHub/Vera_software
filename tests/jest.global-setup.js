// Global setup for Jest backend tests
require('dotenv').config({ path: '../backend/.env.test' });

const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Setting up test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://vera_test:password@localhost:5432/vera_test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.PORT = '3002'; // Different port for tests
  
  try {
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    process.exit(1);
  }
};