# VERA Test Suite

This directory contains comprehensive tests for the VERA Environmental Awareness application, including backend API tests, frontend component tests, and end-to-end integration tests.

## Test Structure

```
tests/
├── backend/                 # Backend API tests (Jest + Supertest)
│   ├── auth.test.ts        # Authentication endpoint tests
│   ├── energy.test.ts      # Energy monitoring tests
│   └── ...
├── frontend/               # Frontend component tests (Vitest + Testing Library)
│   ├── LoginPage.test.tsx  # Login page component tests
│   └── ...
├── e2e/                   # End-to-end tests (Playwright)
│   ├── app.spec.ts        # Full application flow tests
│   ├── global-setup.ts    # E2E test setup
│   └── global-teardown.ts # E2E test cleanup
├── coverage/              # Test coverage reports
├── package.json           # Test dependencies and scripts
└── README.md             # This file
```

## Test Technologies

### Backend Tests (Jest + Supertest)
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing Express apps
- **TypeScript**: Full TypeScript support
- **Coverage**: Code coverage reporting

### Frontend Tests (Vitest + Testing Library)
- **Vitest**: Fast unit test framework for Vite projects
- **React Testing Library**: React component testing utilities
- **jsdom**: Browser environment simulation
- **User Event**: User interaction simulation

### E2E Tests (Playwright)
- **Playwright**: Cross-browser end-to-end testing
- **Multi-browser**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: iOS and Android simulation
- **Visual testing**: Screenshots and video recording

## Getting Started

### Prerequisites

1. **Install dependencies**:
   ```bash
   cd tests
   npm install
   ```

2. **Setup test databases**:
   ```bash
   # Create test database
   createdb vera_test
   
   # Set environment variables
   export TEST_DATABASE_URL="postgresql://username:password@localhost:5432/vera_test"
   ```

3. **Install browsers for E2E tests**:
   ```bash
   npx playwright install
   ```

### Running Tests

#### All Tests
```bash
npm test
```

#### Backend Tests Only
```bash
npm run test:backend
```

#### Frontend Tests Only
```bash
npm run test:frontend
```

#### E2E Tests Only
```bash
npm run test:e2e
```

#### Watch Mode (Development)
```bash
npm run test:watch
```

#### With Coverage
```bash
npm run test:coverage
```

## Test Configuration

### Environment Variables

Create a `.env.test` file in the backend directory:

```env
NODE_ENV=test
DATABASE_URL=postgresql://username:password@localhost:5432/vera_test
JWT_SECRET=test-jwt-secret-key
PORT=3002
```

### Jest Configuration (Backend)

File: `jest.backend.config.js`

- Uses `ts-jest` for TypeScript support
- Node.js environment
- Coverage thresholds: 70% minimum
- Custom test timeout: 10 seconds
- Module path mapping for imports

### Vitest Configuration (Frontend)

File: `vitest.frontend.config.ts`

- Uses `jsdom` environment for DOM simulation
- React plugin support
- Coverage with V8 provider
- Path aliases for cleaner imports
- Global test utilities

### Playwright Configuration (E2E)

File: `playwright.config.ts`

- Multi-browser testing
- Mobile device simulation
- Automatic server startup
- Screenshot and video recording
- Parallel test execution

## Writing Tests

### Backend Test Example

```typescript
import request from 'supertest';
import { app } from '../../backend/src/server';

describe('Authentication', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123',
      name: 'Test User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        user: {
          email: userData.email,
          name: userData.name
        },
        token: expect.any(String)
      }
    });
  });
});
```

### Frontend Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '@/pages/auth/LoginPage';

describe('LoginPage', () => {
  it('should display login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert expected behavior
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete login flow', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

## Test Data Management

### Backend Tests
- Uses test database with isolated transactions
- Mock external API calls
- Create and clean up test data per test

### Frontend Tests
- Mock API responses with fetch mock
- Use Testing Library's user interactions
- Clean component state between tests

### E2E Tests
- Use real database with test data
- Reset application state between tests
- Can preserve state for test scenarios

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/backend/` - Backend test coverage
- `coverage/frontend/` - Frontend test coverage
- `coverage/e2e-report/` - E2E test report

### Coverage Thresholds

All test suites maintain minimum 70% coverage for:
- Statements
- Branches
- Functions
- Lines

## Best Practices

### General
1. **Write descriptive test names** that explain what is being tested
2. **Use AAA pattern**: Arrange, Act, Assert
3. **Keep tests independent** - no shared state between tests
4. **Mock external dependencies** to ensure test reliability
5. **Test behavior, not implementation** details

### Backend Tests
1. **Test all HTTP status codes** (success and error cases)
2. **Validate request/response schemas**
3. **Test authentication and authorization**
4. **Mock database operations** for unit tests
5. **Test error handling** thoroughly

### Frontend Tests
1. **Test user interactions** rather than component internals
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Test accessibility** attributes
4. **Mock external API calls**
5. **Test loading and error states**

### E2E Tests
1. **Test critical user journeys** end-to-end
2. **Use data-testid attributes** for reliable element selection
3. **Test on multiple browsers** and devices
4. **Keep tests maintainable** - avoid overly complex scenarios
5. **Use page object patterns** for complex flows

## Debugging Tests

### Backend Tests
```bash
# Run specific test file
npm run test:backend -- auth.test.ts

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand auth.test.ts
```

### Frontend Tests
```bash
# Run specific test
npm run test:frontend -- LoginPage.test.tsx

# Debug mode
npm run test:frontend -- --reporter=verbose LoginPage.test.tsx
```

### E2E Tests
```bash
# Run with browser UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

CI configuration includes:
- Matrix testing across Node.js versions
- Database setup and seeding
- Browser installation
- Coverage reporting
- Test result artifacts

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify test database exists

2. **Port conflicts**:
   - Use different ports for test servers
   - Kill existing processes on test ports

3. **Browser installation issues**:
   - Run `npx playwright install`
   - Check system dependencies

4. **Memory issues with large test suites**:
   - Increase Node.js heap size
   - Run tests in smaller batches
   - Use `--forceExit` flag if needed

### Getting Help

1. Check test logs for detailed error messages
2. Run tests with verbose output
3. Use debugger breakpoints in test code
4. Consult framework documentation:
   - [Jest Documentation](https://jestjs.io/docs)
   - [Vitest Documentation](https://vitest.dev/)
   - [Playwright Documentation](https://playwright.dev/)
   - [Testing Library Documentation](https://testing-library.com/)

---

For more information about the VERA application, see the main [README.md](../README.md) and [documentation](../docs/).