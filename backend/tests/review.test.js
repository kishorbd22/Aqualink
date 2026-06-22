const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, mockListing, mockOrder, mockReview, UUID_BUYER, UUID_FISHER, UUID_ADMIN, UUID_LISTING, UUID_ORDER, UUID_REVIEW, UUID_NONEXISTENT } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  return { sequelize: { transaction: jest.fn((cb) => cb({})) }, models: {}, Op };
});
jest.mock('../src/services/notificationService', () => ({ createNotification: jest.fn().mockResolvedValue({}) }));

const models = require('../src/models');

describe('Reviews API', () => {
  let buyerToken, fisherToken, adminToken;
  let sampleListing, sampleOrder, sampleReview;

  beforeEach(() => {
    jest.clearAllMocks();
    const buyer = mockUser({ id: UUID_BUYER, role: 'buyer' });
    const fisher = mockUser({ id: UUID_FISHER, role: 'fisher' });
    const admin = mockUser({ id: UUID_ADMIN, role: 'admin' });
    buyerToken = generateToken(buyer);
    fisherToken = generateToken(fisher);
    adminToken = generateToken(admin);
    sampleListing = mockListing({ id: UUID_LISTING, fisherId: UUID_FISHER });
    sampleOrder = mockOrder({ id: UUID_ORDER, buyerId: UUID_BUYER, listingId: UUID_LISTING, status: 'delivered' });
    sampleReview = mockReview({ id: UUID_REVIEW, orderId: UUID_ORDER, buyerId: UUID_BUYER, fisherId: UUID_FISHER, rating: 5 });
    models.models.User = { findByPk: jest.fn().mockResolvedValue(buyer) };
  });

  describe('POST /api/reviews', () => {
    const payload = { orderId: UUID_ORDER, rating: 5 };
    it('should create (buyer)', async () => {
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, listing: sampleListing }) };
      models.models.Review = { findOne: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(sampleReview), findByPk: jest.fn().mockResolvedValue(sampleReview) };
      const res = await request(app).post('/api/reviews').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(201);
      expect(res.body.data.review.rating).toBe(5);
    });
    it('should return 403 for fisher', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_FISHER, role: 'fisher' }));
      await request(app).post('/api/reviews').set('Authorization', `Bearer ${fisherToken}`).send(payload).expect(403);
    });
    it('should return 400 when order not delivered', async () => {
      models.models.Order = { findByPk: jest.fn().mockResolvedValue({ ...sampleOrder, status: 'pending', listing: sampleListing }) };
      const res = await request(app).post('/api/reviews').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(400);
      expect(res.body.error.message).toMatch(/delivered/i);
    });
  });

  describe('GET /api/reviews/fisher/:fisherId/rating', () => {
    it('should return average rating', async () => {
      models.models.Review = { findAll: jest.fn().mockResolvedValue([{ rating: 5 }, { rating: 4 }, { rating: 5 }]) };
      const res = await request(app).get(`/api/reviews/fisher/${UUID_FISHER}/rating`).expect(200);
      expect(res.body.data.rating.averageRating).toBe(4.67);
      expect(res.body.data.rating.totalReviews).toBe(3);
    });
    it('should return 0 for no reviews', async () => {
      models.models.Review = { findAll: jest.fn().mockResolvedValue([]) };
      const res = await request(app).get(`/api/reviews/fisher/${UUID_FISHER}/rating`).expect(200);
      expect(res.body.data.rating.averageRating).toBeNull();
    });
  });

  describe('PATCH /api/reviews/:id', () => {
    it('should update (owner)', async () => {
      models.models.Review = { findByPk: jest.fn().mockResolvedValue(sampleReview) };
      sampleReview.update = jest.fn().mockImplementation(async (d) => { Object.assign(sampleReview, d); return sampleReview; });
      await request(app).patch(`/api/reviews/${UUID_REVIEW}`).set('Authorization', `Bearer ${buyerToken}`).send({ rating: 3 }).expect(200);
    });
    it('should return 403 for non-owner', async () => {
      models.models.User.findByPk.mockResolvedValue(mockUser({ id: UUID_FISHER, role: 'fisher' }));
      models.models.Review = { findByPk: jest.fn().mockResolvedValue(sampleReview) };
      await request(app).patch(`/api/reviews/${UUID_REVIEW}`).set('Authorization', `Bearer ${fisherToken}`).send({ rating: 3 }).expect(403);
    });
  });
});