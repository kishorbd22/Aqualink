const request = require('supertest');
const app = require('../src/app');
const { generateToken, mockUser, mockListing, UUID_BUYER, UUID_FISHER, UUID_ADMIN, UUID_LISTING, UUID_LISTING2, UUID_NONEXISTENT } = require('./helpers');

jest.mock('../src/models', () => {
  const { Op } = require('sequelize');
  return {
    sequelize: { transaction: jest.fn((cb) => cb({ LOCK: { UPDATE: 'UPDATE' } })) },
    models: {},
    Op,
  };
});

jest.mock('../src/services/notificationService', () => ({ createNotification: jest.fn().mockResolvedValue({}) }));
const models = require('../src/models');

describe('Listings API', () => {
  let buyerUser, buyerToken, fisherUser, fisherToken, adminUser, adminToken;
  let sampleListing, anotherListing;

  beforeEach(() => {
    jest.clearAllMocks();
    buyerUser = mockUser({ id: UUID_BUYER, role: 'buyer' });
    fisherUser = mockUser({ id: UUID_FISHER, role: 'fisher' });
    adminUser = mockUser({ id: UUID_ADMIN, role: 'admin' });
    buyerToken = generateToken(buyerUser);
    fisherToken = generateToken(fisherUser);
    adminToken = generateToken(adminUser);
    sampleListing = mockListing({ id: UUID_LISTING, fisherId: UUID_FISHER, species: 'Tuna' });
    anotherListing = mockListing({ id: UUID_LISTING2, fisherId: UUID_FISHER, species: 'Salmon' });
    models.models.User = { findByPk: jest.fn().mockResolvedValue(fisherUser) };
  });

  describe('POST /api/listings', () => {
    const payload = { species: 'Tuna', weight: 100, pricePerKg: 15.5, freshnessTimestamp: '2026-06-20T08:00:00.000Z' };
    it('should create a listing (fisher)', async () => {
      models.models.Listing = { create: jest.fn().mockResolvedValue(sampleListing), findByPk: jest.fn().mockResolvedValue(sampleListing) };
      const res = await request(app).post('/api/listings').set('Authorization', `Bearer ${fisherToken}`).send(payload).expect(201);
      expect(res.body.data.listing.species).toBe('Tuna');
    });
    it('should return 403 for buyer', async () => {
      models.models.User.findByPk.mockResolvedValue(buyerUser);
      await request(app).post('/api/listings').set('Authorization', `Bearer ${buyerToken}`).send(payload).expect(403);
    });
  });

  describe('GET /api/listings', () => {
    it('should get all listings (public)', async () => {
      models.models.Listing = { findAndCountAll: jest.fn().mockResolvedValue({ count: 2, rows: [sampleListing, anotherListing] }) };
      const res = await request(app).get('/api/listings').expect(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('GET /api/listings/:id', () => {
    it('should get a listing by ID', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue(sampleListing) };
      const res = await request(app).get(`/api/listings/${UUID_LISTING}`).expect(200);
      expect(res.body.data.listing.id).toBe(UUID_LISTING);
    });
    it('should return 404', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue(null) };
      await request(app).get(`/api/listings/${UUID_NONEXISTENT}`).expect(404);
    });
  });

  describe('PUT /api/listings/:id', () => {
    it('should update a listing (owner)', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue(sampleListing) };
      sampleListing.update = jest.fn().mockImplementation(async (d) => { Object.assign(sampleListing, d); return sampleListing; });
      const res = await request(app).put(`/api/listings/${UUID_LISTING}`).set('Authorization', `Bearer ${fisherToken}`).send({ species: 'Updated' }).expect(200);
      expect(res.body.success).toBe(true);
    });
    it('should return 403 for non-owner', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue(sampleListing) };
      models.models.User.findByPk.mockResolvedValue(buyerUser);
      await request(app).put(`/api/listings/${UUID_LISTING}`).set('Authorization', `Bearer ${buyerToken}`).send({ species: 'Hacked' }).expect(403);
    });
  });

  describe('DELETE /api/listings/:id', () => {
    it('should delete (owner)', async () => {
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue({ ...sampleListing, destroy: jest.fn() }) };
      await request(app).delete(`/api/listings/${UUID_LISTING}`).set('Authorization', `Bearer ${fisherToken}`).expect(200);
    });
    it('should allow admin to delete', async () => {
      models.models.User.findByPk.mockResolvedValue(adminUser);
      models.models.Listing = { findByPk: jest.fn().mockResolvedValue({ ...sampleListing, destroy: jest.fn() }) };
      await request(app).delete(`/api/listings/${UUID_LISTING}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    });
  });
});