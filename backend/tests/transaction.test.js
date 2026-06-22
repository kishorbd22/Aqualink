const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, mockListing, mockOrder, mockTransaction, UUID_BUYER, UUID_FISHER, UUID_ADMIN, UUID_LISTING, UUID_ORDER, UUID_TRANSACTION, UUID_NONEXISTENT } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  return { sequelize: { transaction: jest.fn((cb) => cb({})) }, models: {}, Op };
});
jest.mock('../src/services/notificationService', () => ({ createNotification: jest.fn().mockResolvedValue({}) }));

const models = require('../src/models');

describe('Transactions API', () => {
  let buyerToken, fisherToken, adminToken;
  let sampleListing, sampleOrder, sampleTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    const buyer = mockUser({ id: UUID_BUYER, role: 'buyer' });
    const fisher = mockUser({ id: UUID_FISHER, role: 'fisher' });
    const admin = mockUser({ id: UUID_ADMIN, role: 'admin' });
    buyerToken = generateToken(buyer);
    fisherToken = generateToken(fisher);
    adminToken = generateToken(admin);
    sampleListing = mockListing({ id: UUID_LISTING, fisherId: UUID_FISHER, pricePerKg: 15.5, weight: 100 });
    sampleOrder = mockOrder({ id: UUID_ORDER, buyerId: UUID_BUYER, listingId: UUID_LISTING, totalPrice: 155.0, status: 'accepted' });
    sampleTransaction = mockTransaction({ id: UUID_TRANSACTION, orderId: UUID_ORDER, amount: 155.0, paymentMethod: 'upi', paymentStatus: 'pending' });
    models.models.User = { findByPk: jest.fn().mockResolvedValue(buyer) };
  });

  describe('POST /api/transactions', () => {
    const payload = { orderId: UUID_ORDER, paymentMethod: 'upi' };
    it('should create (buyer)', async () => {
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, listing: sampleListing }) };
      models.models.Transaction = { findOne: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(sampleTransaction), findByPk: jest.fn().mockResolvedValue(sampleTransaction) };
      models.models.User.findAll = jest.fn().mockResolvedValue([mockUser({ id: UUID_ADMIN, role: 'admin' })]);
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(201);
    });
    it('should return 403 for fisher', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_FISHER, role: 'fisher' }));
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${fisherToken}`).send(payload).expect(403);
    });
    it('should return 400 for invalid payment method', async () => {
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${buyerToken}`).send({ orderId: UUID_ORDER, paymentMethod: 'bitcoin' }).expect(400);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get by ID', async () => {
      models.models.Transaction = { findByPk: jest.fn().mockResolvedValue({ ...sampleTransaction, order: { ...sampleOrder, listing: { ...sampleListing, fisherId: UUID_FISHER } } }) };
      await request(app).get(`/api/transactions/${UUID_TRANSACTION}`).set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
    it('should return 404', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_ADMIN, role: 'admin' }));
      models.models.Transaction = { findByPk: jest.fn().mockResolvedValue(null) };
      await request(app).get(`/api/transactions/${UUID_NONEXISTENT}`).set('Authorization', `Bearer ${adminToken}`).expect(404);
    });
  });

  describe('PATCH /api/transactions/:id/pay', () => {
    it('should mark as paid', async () => {
      models.models.Transaction = {
        findByPk: jest.fn().mockResolvedValueOnce({ ...sampleTransaction, order: { ...sampleOrder, listing: sampleListing } }).mockResolvedValueOnce({ ...sampleTransaction, paymentStatus: 'paid' }),
      };
      await request(app).patch(`/api/transactions/${UUID_TRANSACTION}/pay`).set('Authorization', `Bearer ${buyerToken}`).send({ reference: 'TXN123' }).expect(200);
    });
  });

  describe('PATCH /api/transactions/:id/fail', () => {
    it('should mark as failed', async () => {
      models.models.Transaction = {
        findByPk: jest.fn().mockResolvedValueOnce({ ...sampleTransaction, order: { ...sampleOrder, listing: sampleListing } }).mockResolvedValueOnce({ ...sampleTransaction, paymentStatus: 'failed' }),
      };
      await request(app).patch(`/api/transactions/${UUID_TRANSACTION}/fail`).set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
  });

  describe('PATCH /api/transactions/:id/refund', () => {
    it('should refund (admin only)', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_ADMIN, role: 'admin' }));
      models.models.Transaction = {
        findByPk: jest.fn().mockResolvedValueOnce({ ...sampleTransaction, paymentStatus: 'paid', order: { ...sampleOrder, listing: sampleListing } }).mockResolvedValueOnce({ ...sampleTransaction, paymentStatus: 'refunded' }),
      };
      await request(app).patch(`/api/transactions/${UUID_TRANSACTION}/refund`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    });
    it('should return 403 for non-admin', async () => {
      await request(app).patch(`/api/transactions/${UUID_TRANSACTION}/refund`).set('Authorization', `Bearer ${buyerToken}`).expect(403);
    });
  });
});