/**
 * Aqualink - Auth Integration Tests
 *
 * Tests authentication endpoints: register, login, getMe.
 */

const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, UUID_BUYER, UUID_FISHER } = require('./helpers');

jest.mock('../src/models', () => {
  return {
    sequelize: { transaction: jest.fn((cb) => cb({ LOCK: { UPDATE: 'UPDATE' } })) },
    models: {},
  };
});

const models = require('../src/models');
const bcrypt = require('bcryptjs');

describe('Auth API', () => {
  let buyerUser, buyerToken;

  beforeEach(() => {
    jest.clearAllMocks();
    buyerUser = mockUser({ id: UUID_BUYER, email: 'buyer@test.com', role: 'buyer' });
    buyerToken = generateToken(buyerUser);
  });

  describe('POST /api/auth/register', () => {
    const validPayload = { name: 'New User', phone: '+1234567890', email: 'new@test.com', password: 'password123', role: 'buyer' };

    it('should register a new user and return 201 with token', async () => {
      models.models.User = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async (data) => mockUser({ id: UUID_BUYER, ...data })),
      };
      const res = await request(app).post('/api/auth/register').send(validPayload).expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(validPayload.email);
    });

    it('should return 400 when email already exists', async () => {
      models.models.User = { findOne: jest.fn(({ where }) => Promise.resolve(where.email ? buyerUser : null)) };
      const res = await request(app).post('/api/auth/register').send(validPayload).expect(400);
      expect(res.body.error.message).toMatch(/email already exists/i);
    });

    it('should return 400 when phone already exists', async () => {
      models.models.User = { findOne: jest.fn(({ where }) => Promise.resolve(where.phone ? buyerUser : null)) };
      const res = await request(app).post('/api/auth/register').send(validPayload).expect(400);
      expect(res.body.error.message).toMatch(/phone number already exists/i);
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' }).expect(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return 200 with token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      models.models.User = {
        scope: jest.fn().mockReturnThis(),
        findOne: jest.fn().mockResolvedValue(mockUser({ ...buyerUser, password: hashedPassword })),
      };
      const res = await request(app).post('/api/auth/login').send({ email: 'buyer@test.com', password: 'password123' }).expect(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      models.models.User = { scope: jest.fn().mockReturnThis(), findOne: jest.fn().mockResolvedValue(null) };
      await request(app).post('/api/auth/login').send({ email: 'wrong@test.com', password: 'wrong' }).expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the authenticated user', async () => {
      models.models.User = { findByPk: jest.fn().mockResolvedValue(buyerUser) };
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${buyerToken}`).expect(200);
      expect(res.body.data.user.email).toBe(buyerUser.email);
    });

    it('should return 401 without token', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });
  });
});