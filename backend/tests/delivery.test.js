const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, mockListing, mockOrder, mockDelivery, UUID_BUYER, UUID_FISHER, UUID_TRANSPORTER, UUID_ADMIN, UUID_LISTING, UUID_ORDER, UUID_DELIVERY, UUID_NONEXISTENT } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  return { sequelize: { transaction: jest.fn((cb) => cb({})) }, models: {}, Op };
});
jest.mock('../src/services/notificationService', () => ({ createNotification: jest.fn().mockResolvedValue({}) }));

const models = require('../src/models');

describe('Deliveries API', () => {
  let buyerToken, fisherToken, transporterToken, adminToken;
  let sampleListing, sampleOrder, sampleDelivery;
  const payload = { orderId: UUID_ORDER, transporterId: UUID_TRANSPORTER };

  beforeEach(() => {
    jest.clearAllMocks();
    const buyer = mockUser({ id: UUID_BUYER, role: 'buyer' });
    const fisher = mockUser({ id: UUID_FISHER, role: 'fisher' });
    const transporter = mockUser({ id: UUID_TRANSPORTER, role: 'transporter' });
    const admin = mockUser({ id: UUID_ADMIN, role: 'admin' });
    buyerToken = generateToken(buyer);
    fisherToken = generateToken(fisher);
    transporterToken = generateToken(transporter);
    adminToken = generateToken(admin);
    sampleListing = mockListing({ id: UUID_LISTING, fisherId: UUID_FISHER });
    sampleOrder = mockOrder({ id: UUID_ORDER, buyerId: UUID_BUYER, listingId: UUID_LISTING, status: 'accepted' });
    sampleDelivery = mockDelivery({ id: UUID_DELIVERY, orderId: UUID_ORDER, transporterId: UUID_TRANSPORTER, status: 'assigned' });
    models.models.User = { findByPk: jest.fn().mockResolvedValue(buyer) };
  });

  describe('POST /api/deliveries', () => {
    it('should create (fisher)', async () => {
      // findByPk must return different users based on ID: the auth user (fisher) and the transporter lookup
      models.models.User.findByPk.mockImplementation((id) => {
        if (id === UUID_FISHER) return Promise.resolve(mockUser({ id: UUID_FISHER, role: 'fisher' }));
        if (id === UUID_TRANSPORTER) return Promise.resolve(mockUser({ id: UUID_TRANSPORTER, role: 'transporter' }));
        return Promise.resolve(null);
      });
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, listing: sampleListing }) };
      models.models.Delivery = { findOne: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(sampleDelivery), findByPk: jest.fn().mockResolvedValue(sampleDelivery) };
      await request(app).post('/api/deliveries').set('Authorization', `Bearer ${fisherToken}`).send(payload).expect(201);
    });
    it('should return 403 for buyer', async () => {
      await request(app).post('/api/deliveries').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(403);
    });
    it('should return 400 when order is not accepted', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_FISHER, role: 'fisher' }));
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, status: 'pending', listing: sampleListing }) };
      await request(app).post('/api/deliveries').set('Authorization', `Bearer ${fisherToken}`).send(payload).expect(400);
    });
  });

  describe('GET /api/deliveries/:id', () => {
    it('should get by ID (transporter)', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_TRANSPORTER, role: 'transporter' }));
      models.models.Delivery = { findByPk: jest.fn().mockResolvedValue({ ...sampleDelivery, order: { ...sampleOrder, listing: sampleListing } }) };
      await request(app).get(`/api/deliveries/${UUID_DELIVERY}`).set('Authorization', `Bearer ${transporterToken}`).expect(200);
    });
    it('should return 404', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_ADMIN, role: 'admin' }));
      models.models.Delivery = { findByPk: jest.fn().mockResolvedValue(null) };
      await request(app).get(`/api/deliveries/${UUID_NONEXISTENT}`).set('Authorization', `Bearer ${adminToken}`).expect(404);
    });
  });

  describe('PATCH /api/deliveries/:id/status', () => {
    it('should update to picked_up (transporter)', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_TRANSPORTER, role: 'transporter' }));
      models.models.Delivery = {
        findByPk: jest.fn().mockResolvedValueOnce({ ...sampleDelivery, order: { ...sampleOrder, listing: sampleListing } }).mockResolvedValueOnce({ ...sampleDelivery, status: 'picked_up' }),
      };
      models.models.Transaction = { findOne: jest.fn().mockResolvedValue(null) };
      await request(app).patch(`/api/deliveries/${UUID_DELIVERY}/status`).set('Authorization', `Bearer ${transporterToken}`).send({ status: 'picked_up' }).expect(200);
    });
    it('should reject invalid transitions', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_TRANSPORTER, role: 'transporter' }));
      models.models.Delivery = { findByPk: jest.fn().mockResolvedValue({ ...sampleDelivery, order: { ...sampleOrder, listing: sampleListing } }) };
      const res = await request(app).patch(`/api/deliveries/${UUID_DELIVERY}/status`).set('Authorization', `Bearer ${transporterToken}`).send({ status: 'delivered' }).expect(400);
      expect(res.body.error.message).toMatch(/Cannot transition/i);
    });
  });
});