/**
 * Aqualink - Test Setup
 *
 * Global Jest setup.
 * Mocks database models so all services use mock data.
 * Sets up test environment variables.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.RATE_LIMIT_MAX = '10000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.CORS_ORIGIN = '*';
process.env.CORS_CREDENTIALS = 'true';

// We mock the entire models module so all services get mocked models
// Each test file re-mocks as needed for its specific scenario