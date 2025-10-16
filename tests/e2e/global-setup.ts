import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Setting up E2E test environment...');

  // Start browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for application to be ready
    console.log('Waiting for application to be ready...');
    
    // Check if frontend is ready
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('Frontend is ready');

    // Check if backend is ready
    const response = await page.goto('http://localhost:3001/health');
    if (!response?.ok()) {
      throw new Error('Backend health check failed');
    }
    console.log('Backend is ready');

    // Setup test database with initial data
    await setupTestData(page);

    console.log('E2E test environment setup complete');
  } catch (error) {
    console.error('Failed to setup E2E test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  console.log('Setting up test data...');

  // Create test user account if it doesn't exist
  try {
    await page.goto('http://localhost:5173/register');
    
    // Try to register test user
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.fill('[data-testid="name-input"]', 'Test User');
    
    await page.click('[data-testid="register-button"]');
    
    // Wait for registration to complete (success or failure)
    await page.waitForTimeout(2000);
    
    console.log('Test user setup complete');
  } catch (error) {
    // User might already exist, which is fine
    console.log('Test user may already exist');
  }

  // Add some test energy data
  try {
    // Login as test user
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    console.log('Test data setup complete');
  } catch (error) {
    console.log('Could not setup test data, tests will create their own');
  }
}

export default globalSetup;