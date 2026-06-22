/**
 * Aqualink - Health Check & Placeholder Tests
 */

const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Aqualink Backend');
  });

  it('GET / should return welcome message', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body.message).toBe('Welcome to AquaLink API');
  });
});