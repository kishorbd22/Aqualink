const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, UUID_BUYER, UUID_NOTIFICATION, UUID_NONEXISTENT } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  return { sequelize: { transaction: jest.fn((cb) => cb({})) }, models: {}, Op };
});

const models = require('../src/models');

describe('Notifications API', () => {
  let buyerToken;
  const buyer = mockUser({ id: UUID_BUYER, role: 'buyer' });
  const sampleNotif = { id: UUID_NOTIFICATION, userId: UUID_BUYER, title: 'Test', message: 'Test msg', type: 'order', isRead: false, update: jest.fn().mockImplementation(async function (d) { Object.assign(this, d); return this; }), destroy: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    buyerToken = generateToken(buyer);
    models.models.User = { findByPk: jest.fn().mockResolvedValue(buyer) };
  });

  describe('GET /api/notifications', () => {
    it('should return notifications', async () => {
      models.models.Notification = { count: jest.fn().mockResolvedValue(0), findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }) };
      const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${buyerToken}`).expect(200);
      expect(res.body.data.notifications).toBeDefined();
    });
    it('should return 401 without token', async () => {
      await request(app).get('/api/notifications').expect(401);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return unread count', async () => {
      models.models.Notification = { count: jest.fn().mockResolvedValue(3) };
      const res = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${buyerToken}`).expect(200);
      expect(res.body.data.unreadCount).toBe(3);
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('should get by ID', async () => {
      models.models.Notification = { findByPk: jest.fn().mockResolvedValue(sampleNotif) };
      await request(app).get(`/api/notifications/${UUID_NOTIFICATION}`).set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
    it('should return 404', async () => {
      models.models.Notification = { findByPk: jest.fn().mockResolvedValue(null) };
      await request(app).get(`/api/notifications/${UUID_NONEXISTENT}`).set('Authorization', `Bearer ${buyerToken}`).expect(404);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark as read', async () => {
      models.models.Notification = { findByPk: jest.fn().mockResolvedValue(sampleNotif) };
      const res = await request(app).patch(`/api/notifications/${UUID_NOTIFICATION}/read`).set('Authorization', `Bearer ${buyerToken}`).expect(200);
      expect(res.body.message).toMatch(/marked as read/i);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all as read', async () => {
      models.models.Notification = { update: jest.fn().mockResolvedValue([3]) };
      await request(app).patch('/api/notifications/read-all').set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete', async () => {
      models.models.Notification = { findByPk: jest.fn().mockResolvedValue(sampleNotif) };
      await request(app).delete(`/api/notifications/${UUID_NOTIFICATION}`).set('Authorization', `Bearer ${buyerToken}`).expect(200);
    });
  });
});