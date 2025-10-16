import { test, expect, Page } from '@playwright/test';

// Test configuration and setup
test.describe('VERA Application E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }: { browser: any }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:5173');
  });

  test.describe('Authentication Flow', () => {
    test('should complete full registration and login flow', async () => {
      // Navigate to registration page
      await page.click('text=Sign Up');
      await expect(page).toHaveURL(/.*register/);

      // Fill registration form
      await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123');
      await page.fill('[data-testid="name-input"]', 'E2E Test User');

      // Submit registration
      await page.click('[data-testid="register-button"]');

      // Verify registration success
      await expect(page.locator('text=Registration successful')).toBeVisible();
      
      // Should redirect to dashboard after registration
      await expect(page).toHaveURL(/.*dashboard/);

      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('text=E2E Test User')).toBeVisible();
    });

    test('should login with existing credentials', async () => {
      // Navigate to login page
      await page.click('text=Sign In');
      await expect(page).toHaveURL(/.*login/);

      // Fill login form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');

      // Submit login
      await page.click('[data-testid="login-button"]');

      // Verify login success
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle login with invalid credentials', async () => {
      await page.click('text=Sign In');
      
      await page.fill('[data-testid="email-input"]', 'invalid@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      
      await page.click('[data-testid="login-button"]');

      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      
      // Should remain on login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should logout successfully', async () => {
      // Login first
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Wait for dashboard
      await expect(page).toHaveURL(/.*dashboard/);

      // Click user menu and logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');

      // Should redirect to home page
      await expect(page).toHaveURL(/.*\//);
      
      // User menu should not be visible
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });
  });

  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async () => {
      // Login before each dashboard test
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should navigate between dashboard sections', async () => {
      // Test navigation to energy monitoring
      await page.click('[data-testid="nav-energy"]');
      await expect(page).toHaveURL(/.*energy/);
      await expect(page.locator('h1:has-text("Energy Monitoring")')).toBeVisible();

      // Test navigation to devices
      await page.click('[data-testid="nav-devices"]');
      await expect(page).toHaveURL(/.*devices/);
      await expect(page.locator('h1:has-text("Device Management")')).toBeVisible();

      // Test navigation to settings
      await page.click('[data-testid="nav-settings"]');
      await expect(page).toHaveURL(/.*settings/);
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

      // Test navigation back to dashboard
      await page.click('[data-testid="nav-dashboard"]');
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });

    test('should display energy metrics on dashboard', async () => {
      // Check that energy metrics are displayed
      await expect(page.locator('[data-testid="energy-consumption-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="carbon-footprint-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="efficiency-score-card"]')).toBeVisible();

      // Check that metrics have values
      await expect(page.locator('[data-testid="energy-consumption-value"]')).toHaveText(/\d+/);
      await expect(page.locator('[data-testid="carbon-footprint-value"]')).toHaveText(/\d+/);
      await expect(page.locator('[data-testid="efficiency-score-value"]')).toHaveText(/\d+/);
    });

    test('should display energy chart', async () => {
      // Check that energy chart is visible
      await expect(page.locator('[data-testid="energy-chart"]')).toBeVisible();

      // Check chart controls
      await expect(page.locator('[data-testid="chart-timeframe-selector"]')).toBeVisible();
      
      // Test timeframe selection
      await page.click('[data-testid="chart-timeframe-selector"]');
      await page.click('text=1 Hour');
      
      // Chart should update (wait for animation)
      await page.waitForTimeout(1000);
      
      // Test different timeframes
      await page.click('[data-testid="chart-timeframe-selector"]');
      await page.click('text=24 Hours');
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Energy Monitoring Features', () => {
    test.beforeEach(async () => {
      // Login and navigate to energy page
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-energy"]');
    });

    test('should display real-time energy monitoring', async () => {
      // Check real-time monitoring components
      await expect(page.locator('[data-testid="realtime-cpu-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="realtime-memory-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="realtime-power-consumption"]')).toBeVisible();

      // Values should update (check for changes over time)
      const initialCpuValue = await page.locator('[data-testid="cpu-usage-value"]').textContent();
      
      // Wait for potential updates
      await page.waitForTimeout(5000);
      
      const updatedCpuValue = await page.locator('[data-testid="cpu-usage-value"]').textContent();
      
      // Values might change or stay the same, just ensure they're numeric
      expect(initialCpuValue).toMatch(/\d+/);
      expect(updatedCpuValue).toMatch(/\d+/);
    });

    test('should show detailed metrics in expandable cards', async () => {
      // Click to expand CPU metrics
      await page.click('[data-testid="cpu-metrics-expand"]');
      
      // Check detailed CPU metrics are visible
      await expect(page.locator('[data-testid="cpu-temperature"]')).toBeVisible();
      await expect(page.locator('[data-testid="cpu-frequency"]')).toBeVisible();
      await expect(page.locator('[data-testid="cpu-cores"]')).toBeVisible();

      // Collapse and check it's hidden
      await page.click('[data-testid="cpu-metrics-collapse"]');
      await expect(page.locator('[data-testid="cpu-temperature"]')).not.toBeVisible();
    });

    test('should filter energy data by device', async () => {
      // Check device filter is available
      await expect(page.locator('[data-testid="device-filter"]')).toBeVisible();
      
      // Select a specific device
      await page.click('[data-testid="device-filter"]');
      await page.click('[data-testid="device-option-desktop"]');
      
      // Data should update to show only desktop device data
      await expect(page.locator('[data-testid="filtered-device-name"]')).toHaveText(/desktop/i);
      
      // Test "All Devices" filter
      await page.click('[data-testid="device-filter"]');
      await page.click('[data-testid="device-option-all"]');
    });
  });

  test.describe('Device Management', () => {
    test.beforeEach(async () => {
      // Login and navigate to devices page
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-devices"]');
    });

    test('should display list of devices', async () => {
      // Check devices list is visible
      await expect(page.locator('[data-testid="devices-list"]')).toBeVisible();
      
      // Check at least one device is shown
      await expect(page.locator('[data-testid="device-card"]').first()).toBeVisible();
      
      // Check device information is displayed
      await expect(page.locator('[data-testid="device-name"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="device-status"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="device-type"]').first()).toBeVisible();
    });

    test('should add a new device', async () => {
      // Click add device button
      await page.click('[data-testid="add-device-button"]');
      
      // Fill device form
      await page.fill('[data-testid="device-name-input"]', 'Test Laptop');
      await page.selectOption('[data-testid="device-type-select"]', 'laptop');
      
      // Fill hardware specifications
      await page.fill('[data-testid="cpu-model-input"]', 'Intel Core i7-12700H');
      await page.fill('[data-testid="cpu-cores-input"]', '12');
      await page.fill('[data-testid="memory-total-input"]', '16384');
      await page.fill('[data-testid="memory-type-input"]', 'DDR4');
      
      // Submit form
      await page.click('[data-testid="save-device-button"]');
      
      // Verify device was added
      await expect(page.locator('text=Test Laptop')).toBeVisible();
      await expect(page.locator('text=Device added successfully')).toBeVisible();
    });

    test('should edit device information', async () => {
      // Click edit on first device
      await page.click('[data-testid="edit-device-button"]').first();
      
      // Update device name
      await page.fill('[data-testid="device-name-input"]', 'Updated Device Name');
      
      // Save changes
      await page.click('[data-testid="save-device-button"]');
      
      // Verify changes were saved
      await expect(page.locator('text=Updated Device Name')).toBeVisible();
      await expect(page.locator('text=Device updated successfully')).toBeVisible();
    });

    test('should delete a device', async () => {
      // Count initial devices
      const initialDeviceCount = await page.locator('[data-testid="device-card"]').count();
      
      // Click delete on first device
      await page.click('[data-testid="delete-device-button"]').first();
      
      // Confirm deletion in modal
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify device was deleted
      await expect(page.locator('text=Device deleted successfully')).toBeVisible();
      
      // Check device count decreased
      const finalDeviceCount = await page.locator('[data-testid="device-card"]').count();
      expect(finalDeviceCount).toBe(initialDeviceCount - 1);
    });
  });

  test.describe('Settings and Profile', () => {
    test.beforeEach(async () => {
      // Login and navigate to settings
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-settings"]');
    });

    test('should update user profile', async () => {
      // Navigate to profile tab
      await page.click('[data-testid="profile-tab"]');
      
      // Update profile information
      await page.fill('[data-testid="user-name-input"]', 'Updated Test User');
      
      // Save changes
      await page.click('[data-testid="save-profile-button"]');
      
      // Verify changes were saved
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });

    test('should change password', async () => {
      // Navigate to security tab
      await page.click('[data-testid="security-tab"]');
      
      // Fill password change form
      await page.fill('[data-testid="current-password-input"]', 'password123');
      await page.fill('[data-testid="new-password-input"]', 'NewPassword456');
      await page.fill('[data-testid="confirm-new-password-input"]', 'NewPassword456');
      
      // Submit password change
      await page.click('[data-testid="change-password-button"]');
      
      // Verify password was changed
      await expect(page.locator('text=Password changed successfully')).toBeVisible();
    });

    test('should update energy goals', async () => {
      // Navigate to energy goals tab
      await page.click('[data-testid="energy-goals-tab"]');
      
      // Update energy goals
      await page.fill('[data-testid="daily-goal-input"]', '50');
      await page.fill('[data-testid="weekly-goal-input"]', '300');
      await page.fill('[data-testid="monthly-goal-input"]', '1200');
      
      // Save goals
      await page.click('[data-testid="save-goals-button"]');
      
      // Verify goals were saved
      await expect(page.locator('text=Energy goals updated successfully')).toBeVisible();
    });

    test('should toggle theme', async () => {
      // Navigate to preferences tab
      await page.click('[data-testid="preferences-tab"]');
      
      // Check current theme
      const currentTheme = await page.getAttribute('html', 'data-theme');
      
      // Toggle theme
      await page.click('[data-testid="theme-toggle"]');
      
      // Wait for theme change
      await page.waitForTimeout(500);
      
      // Verify theme changed
      const newTheme = await page.getAttribute('html', 'data-theme');
      expect(newTheme).not.toBe(currentTheme);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      
      // Login
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      
      // Navigate using mobile menu
      await page.click('[data-testid="mobile-nav-energy"]');
      await expect(page).toHaveURL(/.*energy/);
    });

    test('should work correctly on tablet devices', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Login and check layout adapts
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Check tablet layout
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should meet basic accessibility requirements', async () => {
      // Check for proper heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeDefined();
      }
      
      // Check for form labels
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const id = await inputs.nth(i).getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test('should load main pages within acceptable time', async () => {
      const startTime = Date.now();
      
      // Navigate to dashboard
      await page.click('text=Sign In');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Wait for dashboard to load
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });
});