const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, UUID_BUYER, UUID_FISHER, UUID_TRANSPORTER, UUID_ADMIN } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  const sequelize = { fn: jest.fn((fn, col) => ({ fn, col })), col: jest.fn((col) => col), transaction: jest.fn((cb) => cb({})) };
  return { sequelize, models: {}, Op, fn: sequelize.fn, col: sequelize.col };
});
jest.mock('../src/services/notificationService', () => ({ createNotification: jest.fn().mockResolvedValue({}) }));
const models = require('../src/models');

describe('Dashboard API', () => {
  let adminToken, fisherToken, buyerToken, transporterToken;

  beforeEach(() => {
    jest.clearAllMocks();
    adminToken = generateToken(mockUser({ id: UUID_ADMIN, role: 'admin' }));
    fisherToken = generateToken(mockUser({ id: UUID_FISHER, role: 'fisher' }));
    buyerToken = generateToken(mockUser({ id: UUID_BUYER, role: 'buyer' }));
    transporterToken = generateToken(mockUser({ id: UUID_TRANSPORTER, role: 'transporter' }));
    models.models.User = { findByPk: jest.fn().mockResolvedValue(mockUser({ id: UUID_ADMIN, role: 'admin' })) };
  });

  describe('GET /api/dashboard/admin', () => {
    it('should return admin dashboard', async () => {
      models.models.User.findAll = jest.fn().mockResolvedValue([{ role: 'buyer', count: '10' }]);
      models.models.Listing = { findAll: jest.fn().mockResolvedValue([{ status: 'available', count: '20' }]) };
      models.models.Order = { findAll: jest.fn().mockResolvedValue([{ status: 'pending', count: '15' }]) };
      models.models.Transaction = { findAll: jest.fn().mockResolvedValue([{ paymentStatus: 'paid', count: '8' }]), findOne: jest.fn().mockResolvedValue({ totalRevenue: '10000' }) };
      models.models.Delivery = { findAll: jest.fn().mockResolvedValue([{ status: 'assigned', count: '5' }]) };
      models.models.Review = { findOne: jest.fn().mockResolvedValue({ totalReviews: '50', averageRating: '4.5' }) };
      const res = await request(app).get('/api/dashboard/admin').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.data).toHaveProperty('users');
    });
    it('should return 403 for fisher', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_FISHER, role: 'fisher' }));
      await request(app).get('/api/dashboard/admin').set('Authorization', `Bearer ${fisherToken}`).expect(403);
    });
  });

  describe('GET /api/dashboard/fisher', () => {
    it('should return fisher dashboard', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_FISHER, role: 'fisher' }));
      models.models.Listing = { findAll: jest.fn().mockResolvedValue([{ status: 'available', count: '5' }]) };
      models.models.Order = { findAll: jest.fn().mockResolvedValue([{ status: 'accepted', count: '3' }]) };
      models.models.Transaction = { findOne: jest.fn().mockResolvedValue({ totalRevenue: '2000' }) };
      models.models.Review = { findOne: jest.fn().mockResolvedValue({ totalReviews: '10', averageRating: '4.2' }) };
      await request(app).get('/api/dashboard/fisher').set('Authorization', `Bearer ${fisherToken}`).expect(200);
    });
    it('should return 403 for buyer', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_BUYER, role: 'buyer' }));
      await request(app).get('/api/dashboard/fisher').set('Authorization', `Bearer ${buyerToken}`).expect(403);
    });
  });

  describe('GET /api/dashboard/buyer', () => {
    it('should return buyer dashboard', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_BUYER, role: 'buyer' }));
      models.models.Order = { findAll: jest.fn().mockResolvedValue([{ status: 'delivered', count: '5' }]), findOne: jest.fn().mockResolvedValue({ totalSpending: '3000' }) };
      models.models.Transaction = { findAll: jest.fn().mockResolvedValue([{ paymentStatus: 'paid', count: '3' }]) };
      models.models.Review = { findAll: jest.fn().mockResolvedValue([{ count: '2' }]) };
      await request(app).get('/api/dashboard/buyer').set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
  });

  describe('GET /api/dashboard/transporter', () => {
    it('should return transporter dashboard', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_TRANSPORTER, role: 'transporter' }));
      models.models.Delivery = { findAll: jest.fn().mockResolvedValue([{ status: 'assigned', count: '2' }, { status: 'delivered', count: '5' }]) };
      const res = await request(app).get('/api/dashboard/transporter').set('Authorization', `Bearer ${transporterToken}`).expect(200);
      expect(res.body.data.deliveries).toHaveLength(2);
    });
    it('should return 403 for buyer', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_BUYER, role: 'buyer' }));
      await request(app).get('/api/dashboard/transporter').set('Authorization', `Bearer ${buyerToken}`).expect(403);
    });
  });
});