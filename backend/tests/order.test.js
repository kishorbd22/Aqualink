const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, mockListing, mockOrder, UUID_BUYER, UUID_FISHER, UUID_ADMIN, UUID_LISTING, UUID_ORDER, UUID_NONEXISTENT, UUID_OTHER } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  return { sequelize: { transaction: jest.fn((cb) => cb({ LOCK: { UPDATE: 'UPDATE' } })) }, models: {}, Op, Sequelize: { Op } };
});
jest.mock('../src/services/notificationService', () => ({ createNotification: jest.fn().mockResolvedValue({}) }));
const models = require('../src/models');

describe('Orders API', () => {
  let buyerUser, buyerToken, fisherUser, fisherToken, adminUser, adminToken;
  let sampleListing, sampleOrder;

  beforeEach(() => {
    jest.clearAllMocks();
    buyerUser = mockUser({ id: UUID_BUYER, role: 'buyer' });
    fisherUser = mockUser({ id: UUID_FISHER, role: 'fisher' });
    adminUser = mockUser({ id: UUID_ADMIN, role: 'admin' });
    buyerToken = generateToken(buyerUser);
    fisherToken = generateToken(fisherUser);
    adminToken = generateToken(adminUser);
    sampleListing = mockListing({ id: UUID_LISTING, fisherId: UUID_FISHER, species: 'Tuna', weight: 100, pricePerKg: 15.5, status: 'available' });
    sampleOrder = mockOrder({ id: UUID_ORDER, buyerId: UUID_BUYER, listingId: UUID_LISTING, quantityKg: 10, totalPrice: 155.0, status: 'pending' });
    models.models.User = { findByPk: jest.fn().mockResolvedValue(buyerUser) };
  });

  describe('POST /api/orders', () => {
    const payload = { listingId: UUID_LISTING, quantityKg: 10 };
    it('should create (buyer)', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue(sampleListing) };
      models.models.Order = { create: jest.fn().mockResolvedValue(sampleOrder), findByPk: jest.fn().mockResolvedValue(sampleOrder) };
      const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(201);
      expect(res.body.data.order.status).toBe('pending');
    });
    it('should return 403 for fisher', async () => {
      models.models.User.findByPk.mockResolvedValue(fisherUser);
      await request(app).post('/api/orders').set('Authorization', `Bearer ${fisherToken}`).send(payload).expect(403);
    });
    it('should return 400 when listing sold', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue({ ...sampleListing, status: 'sold' }) };
      const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(400);
      expect(res.body.error.message).toMatch(/not available/i);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by ID (buyer)', async () => {
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, listing: { fisherId: UUID_FISHER } }) };
      await request(app).get(`/api/orders/${UUID_ORDER}`).set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
    it('should return 403 for unauthorized user', async () => {
      const other = mockUser({ id: UUID_OTHER, role: 'buyer' });
      models.models.User.findByPk.mockResolvedValue(other);
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, listing: { fisherId: UUID_FISHER } }) };
      await request(app).get(`/api/orders/${UUID_ORDER}`).set('Authorization', `Bearer ${generateToken(other)}`).expect(403);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update status to accepted', async () => {
      models.models.User.findByPk.mockResolvedValue(fisherUser);
      models.models.Order = {
        findByPk: jest.fn().mockResolvedValueOnce({ ...sampleOrder, listing: sampleListing }).mockResolvedValueOnce({ ...sampleOrder, status: 'accepted' }),
      };
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue(sampleListing) };
      await request(app).patch(`/api/orders/${UUID_ORDER}/status`).set('Authorization', `Bearer ${fisherToken}`).send({ status: 'accepted' }).expect(200);
    });
    it('should reject invalid transitions', async () => {
      models.models.User.findByPk.mockResolvedValue(fisherUser);
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, listing: sampleListing }) };
      const res = await request(app).patch(`/api/orders/${UUID_ORDER}/status`).set('Authorization', `Bearer ${fisherToken}`).send({ status: 'delivered' }).expect(400);
      expect(res.body.error.message).toMatch(/Cannot change status/i);
    });
  });
});