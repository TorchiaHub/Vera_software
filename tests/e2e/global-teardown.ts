import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Tearing down E2E test environment...');

  try {
    // Clean up test data if needed
    console.log('Cleaning up test data...');
    
    // Any cleanup operations would go here
    // For example, clearing test database records
    
    console.log('E2E test environment teardown complete');
  } catch (error) {
    console.error('Failed to teardown E2E test environment:', error);
  }
}

export default globalTeardown;