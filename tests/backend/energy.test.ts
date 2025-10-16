import request from 'supertest';
import { app } from '../../backend/src/server';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

describe('Energy Monitoring Endpoints', () => {
  let server: any;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'energy@example.com',
        password: 'SecurePassword123',
        name: 'Energy User'
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/energy/data', () => {
    const validEnergyData = {
      deviceId: 'device_123',
      timestamp: '2025-10-16T12:00:00.000Z',
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
        gpu: {
          usage: 30.5,
          memory: 8192,
          temperature: 70.0,
          fanSpeed: 65
        },
        disk: {
          read: 100.5,
          write: 50.2,
          usage: 75.0,
          temperature: 45.0
        },
        network: {
          download: 1024,
          upload: 512,
          latency: 15
        }
      },
      powerConsumption: 125.5,
      carbonFootprint: 0.08
    };

    it('should submit energy data successfully', async () => {
      const response = await request(app)
        .post('/api/energy/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validEnergyData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Energy data recorded successfully',
        data: {
          id: expect.any(String),
          timestamp: validEnergyData.timestamp
        }
      });
    });

    it('should reject energy data without authentication', async () => {
      const response = await request(app)
        .post('/api/energy/data')
        .send(validEnergyData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR'
        }
      });
    });

    it('should reject energy data with invalid metrics', async () => {
      const invalidData = {
        ...validEnergyData,
        metrics: {
          cpu: {
            usage: 150, // Invalid: > 100
            temperature: 65.0,
            frequency: 2400,
            cores: 8,
            threads: 16
          }
        }
      };

      const response = await request(app)
        .post('/api/energy/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });

    it('should reject energy data with missing required fields', async () => {
      const incompleteData = {
        deviceId: 'device_123',
        // Missing timestamp, metrics, powerConsumption
      };

      const response = await request(app)
        .post('/api/energy/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });

    it('should accept energy data with optional fields missing', async () => {
      const minimalData = {
        deviceId: 'device_123',
        timestamp: '2025-10-16T12:00:00.000Z',
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
          // Missing gpu, network (optional)
        },
        powerConsumption: 125.5
        // Missing carbonFootprint (optional)
      };

      const response = await request(app)
        .post('/api/energy/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Energy data recorded successfully'
      });
    });
  });

  describe('POST /api/energy/batch', () => {
    it('should submit batch energy data successfully', async () => {
      const batchData = {
        data: [
          {
            deviceId: 'device_123',
            timestamp: '2025-10-16T12:00:00.000Z',
            metrics: {
              cpu: { usage: 45.2, temperature: 65.0, frequency: 2400, cores: 8, threads: 16 },
              memory: { total: 16384, used: 8192, available: 8192, cached: 2048 },
              disk: { read: 100.5, write: 50.2, usage: 75.0 }
            },
            powerConsumption: 125.5
          },
          {
            deviceId: 'device_123',
            timestamp: '2025-10-16T12:01:00.000Z',
            metrics: {
              cpu: { usage: 47.1, temperature: 66.0, frequency: 2400, cores: 8, threads: 16 },
              memory: { total: 16384, used: 8500, available: 7884, cached: 2048 },
              disk: { read: 102.1, write: 48.9, usage: 75.0 }
            },
            powerConsumption: 127.2
          }
        ]
      };

      const response = await request(app)
        .post('/api/energy/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send(batchData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Batch energy data recorded successfully',
        data: {
          recorded: 2,
          ids: expect.arrayContaining([
            expect.any(String),
            expect.any(String)
          ])
        }
      });
    });

    it('should reject empty batch data', async () => {
      const response = await request(app)
        .post('/api/energy/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: [] })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });

  describe('GET /api/energy/history', () => {
    beforeEach(async () => {
      // Submit some test energy data
      const testData = [
        {
          deviceId: 'device_123',
          timestamp: '2025-10-16T10:00:00.000Z',
          metrics: {
            cpu: { usage: 40.0, temperature: 60.0, frequency: 2400, cores: 8, threads: 16 },
            memory: { total: 16384, used: 6000, available: 10384, cached: 2048 },
            disk: { read: 80.0, write: 40.0, usage: 70.0 }
          },
          powerConsumption: 110.0
        },
        {
          deviceId: 'device_123',
          timestamp: '2025-10-16T11:00:00.000Z',
          metrics: {
            cpu: { usage: 50.0, temperature: 70.0, frequency: 2400, cores: 8, threads: 16 },
            memory: { total: 16384, used: 8000, available: 8384, cached: 2048 },
            disk: { read: 120.0, write: 60.0, usage: 75.0 }
          },
          powerConsumption: 140.0
        }
      ];

      for (const data of testData) {
        await request(app)
          .post('/api/energy/data')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data);
      }
    });

    it('should retrieve energy history successfully', async () => {
      const response = await request(app)
        .get('/api/energy/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          history: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              deviceId: 'device_123',
              timestamp: expect.any(String),
              powerConsumption: expect.any(Number),
              metrics: expect.any(Object)
            })
          ]),
          pagination: {
            page: 1,
            limit: 100,
            total: expect.any(Number),
            pages: expect.any(Number)
          },
          summary: {
            totalConsumption: expect.any(Number),
            averageConsumption: expect.any(Number),
            efficiency: expect.any(Number)
          }
        }
      });
    });

    it('should filter energy history by timeframe', async () => {
      const response = await request(app)
        .get('/api/energy/history?timeframe=1h')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toBeInstanceOf(Array);
    });

    it('should filter energy history by device', async () => {
      const response = await request(app)
        .get('/api/energy/history?device=device_123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.history.forEach((entry: any) => {
        expect(entry.deviceId).toBe('device_123');
      });
    });

    it('should paginate energy history results', async () => {
      const response = await request(app)
        .get('/api/energy/history?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.limit).toBe(1);
      expect(response.body.data.history.length).toBeLessThanOrEqual(1);
    });

    it('should reject energy history without authentication', async () => {
      const response = await request(app)
        .get('/api/energy/history')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR'
        }
      });
    });
  });

  describe('GET /api/energy/stats', () => {
    beforeEach(async () => {
      // Submit test data for statistics
      const testData = {
        deviceId: 'device_123',
        timestamp: '2025-10-16T12:00:00.000Z',
        metrics: {
          cpu: { usage: 45.2, temperature: 65.0, frequency: 2400, cores: 8, threads: 16 },
          memory: { total: 16384, used: 8192, available: 8192, cached: 2048 },
          disk: { read: 100.5, write: 50.2, usage: 75.0 }
        },
        powerConsumption: 125.5,
        carbonFootprint: 0.08
      };

      await request(app)
        .post('/api/energy/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData);
    });

    it('should retrieve energy statistics successfully', async () => {
      const response = await request(app)
        .get('/api/energy/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          period: 'day',
          consumption: {
            total: expect.any(Number),
            average: expect.any(Number),
            peak: expect.any(Number),
            minimum: expect.any(Number)
          },
          carbonFootprint: {
            total: expect.any(Number),
            average: expect.any(Number)
          },
          efficiency: {
            score: expect.any(Number),
            trend: expect.any(String)
          }
        }
      });
    });

    it('should retrieve energy statistics for different periods', async () => {
      const periods = ['day', 'week', 'month', 'year'];

      for (const period of periods) {
        const response = await request(app)
          .get(`/api/energy/stats?period=${period}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(period);
      }
    });

    it('should reject invalid period parameter', async () => {
      const response = await request(app)
        .get('/api/energy/stats?period=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });

  describe('PUT /api/energy/goals', () => {
    it('should update energy goals successfully', async () => {
      const goals = {
        daily: 45,
        weekly: 280,
        monthly: 1100,
        carbonFootprint: 90,
        efficiency: 0.88
      };

      const response = await request(app)
        .put('/api/energy/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goals)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Energy goals updated successfully'
      });
    });

    it('should validate energy goals input', async () => {
      const invalidGoals = {
        daily: -10, // Negative value
        weekly: 'invalid', // Wrong type
        efficiency: 1.5 // > 1.0
      };

      const response = await request(app)
        .put('/api/energy/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGoals)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });

    it('should allow partial goal updates', async () => {
      const partialGoals = {
        daily: 50
        // Only updating daily goal
      };

      const response = await request(app)
        .put('/api/energy/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialGoals)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Energy goals updated successfully'
      });
    });
  });
});