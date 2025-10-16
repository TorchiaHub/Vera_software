import request from 'supertest';
import { app } from '../../backend/src/server';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

describe('Authentication Endpoints', () => {
  let server: any;

  beforeAll(async () => {
    // Start test server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Close test server
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // This would typically reset the test database
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
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
        message: 'User registered successfully',
        data: {
          user: {
            email: userData.email,
            name: userData.name
          },
          token: expect.any(String)
        }
      });

      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePassword123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('Invalid email format')
        }
      });
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('Password must be at least 8 characters')
        }
      });
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        name: 'Test User'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: expect.stringContaining('already exists')
        }
      });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'SecurePassword123',
          name: 'Login User'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'SecurePassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            email: loginData.email,
            name: 'Login User'
          },
          token: expect.any(String)
        }
      });

      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: expect.stringContaining('Invalid credentials')
        }
      });
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: expect.stringContaining('Invalid credentials')
        }
      });
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    let validToken: string;

    beforeEach(async () => {
      // Register and login to get a valid token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'SecurePassword123',
          name: 'Refresh User'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'SecurePassword123'
        });

      validToken = loginResponse.body.data.token;
    });

    it('should refresh token successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          token: expect.any(String),
          expiresIn: expect.any(String)
        }
      });

      expect(response.body.data.token).not.toBe(validToken);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR'
        }
      });
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR'
        }
      });
    });
  });

  describe('POST /api/auth/change-password', () => {
    let validToken: string;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123',
          name: 'Change Pass User'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123'
        });

      validToken = loginResponse.body.data.token;
    });

    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password changed successfully'
      });

      // Verify old password no longer works
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123'
        })
        .expect(401);

      // Verify new password works
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'NewPassword456'
        })
        .expect(200);
    });

    it('should reject password change with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('current password')
        }
      });
    });

    it('should reject password change without authentication', async () => {
      const passwordData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR'
        }
      });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'forgot@example.com',
          password: 'Password123',
          name: 'Forgot User'
        });
    });

    it('should send password reset email for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'forgot@example.com'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset email sent'
      });
    });

    it('should not reveal if email exists (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset email sent'
      });
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });
});