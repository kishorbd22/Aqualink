/**
 * Aqualink - Test Helpers
 *
 * Shared mock factories, token generation, and request helpers.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

/**
 * Generate a JWT for a given user object.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// UUID v4 valid format (13th char must be 4)
const UUID_BUYER = '00000000-0000-4000-a000-000000000001';
const UUID_FISHER = '00000000-0000-4000-a000-000000000002';
const UUID_TRANSPORTER = '00000000-0000-4000-a000-000000000003';
const UUID_ADMIN = '00000000-0000-4000-a000-000000000099';
const UUID_LISTING = '00000000-0000-4000-a000-000000000010';
const UUID_LISTING2 = '00000000-0000-4000-a000-000000000011';
const UUID_ORDER = '00000000-0000-4000-a000-000000000020';
const UUID_TRANSACTION = '00000000-0000-4000-a000-000000000030';
const UUID_DELIVERY = '00000000-0000-4000-a000-000000000040';
const UUID_NOTIFICATION = '00000000-0000-4000-a000-000000000050';
const UUID_REVIEW = '00000000-0000-4000-a000-000000000060';
const UUID_NONEXISTENT = '00000000-0000-4000-a000-000000009999';
const UUID_OTHER = '00000000-0000-4000-a000-000000008888';

/**
 * Create a mock user object.
 */
const mockUser = (overrides = {}) => ({
  id: UUID_BUYER,
  name: 'Test User',
  phone: '+1234567890',
  email: 'test@example.com',
  role: 'buyer',
  password: '$2a$10$testhashedpassword',
  toJSON: function () {
    const json = { ...this };
    delete json.password;
    return json;
  },
  ...overrides,
});

/**
 * Create a mock listing object.
 */
const mockListing = (overrides = {}) => ({
  id: UUID_LISTING,
  fisherId: UUID_FISHER,
  species: 'Tuna',
  weight: 100.0,
  pricePerKg: 15.5,
  freshnessTimestamp: new Date('2026-06-20T08:00:00Z'),
  status: 'available',
  photoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () { return { ...this }; },
  update: async function (data) {
    Object.assign(this, data);
    return this;
  },
  destroy: async function () { return true; },
  ...overrides,
});

/**
 * Create a mock order object.
 */
const mockOrder = (overrides = {}) => ({
  id: UUID_ORDER,
  buyerId: UUID_BUYER,
  listingId: UUID_LISTING,
  quantityKg: 10,
  totalPrice: 155.0,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () { return { ...this }; },
  update: async function (data) {
    Object.assign(this, data);
    return this;
  },
  destroy: async function () { return true; },
  ...overrides,
});

/**
 * Create a mock transaction object.
 */
const mockTransaction = (overrides = {}) => ({
  id: UUID_TRANSACTION,
  orderId: UUID_ORDER,
  amount: 155.0,
  paymentMethod: 'upi',
  paymentStatus: 'pending',
  settlementStatus: 'pending',
  transactionReference: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () { return { ...this }; },
  update: async function (data) {
    Object.assign(this, data);
    return this;
  },
  destroy: async function () { return true; },
  ...overrides,
});

/**
 * Create a mock delivery object.
 */
const mockDelivery = (overrides = {}) => ({
  id: UUID_DELIVERY,
  orderId: UUID_ORDER,
  transporterId: UUID_TRANSPORTER,
  pickupTime: null,
  deliveryTime: null,
  status: 'assigned',
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () { return { ...this }; },
  update: async function (data) {
    Object.assign(this, data);
    return this;
  },
  destroy: async function () { return true; },
  ...overrides,
});

/**
 * Create a mock notification object.
 */
const mockNotification = (overrides = {}) => ({
  id: UUID_NOTIFICATION,
  userId: UUID_BUYER,
  title: 'Test Notification',
  message: 'This is a test notification.',
  type: 'order',
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () { return { ...this }; },
  update: async function (data) {
    Object.assign(this, data);
    return this;
  },
  destroy: async function () { return true; },
  ...overrides,
});

/**
 * Create a mock review object.
 */
const mockReview = (overrides = {}) => ({
  id: UUID_REVIEW,
  orderId: UUID_ORDER,
  buyerId: UUID_BUYER,
  fisherId: UUID_FISHER,
  rating: 5,
  comment: 'Excellent fish!',
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: function () { return { ...this }; },
  update: async function (data) {
    Object.assign(this, data);
    return this;
  },
  destroy: async function () { return true; },
  ...overrides,
});

module.exports = {
  generateToken,
  mockUser,
  mockListing,
  mockOrder,
  mockTransaction,
  mockDelivery,
  mockNotification,
  mockReview,
  UUID_BUYER,
  UUID_FISHER,
  UUID_TRANSPORTER,
  UUID_ADMIN,
  UUID_LISTING,
  UUID_ORDER,
  UUID_TRANSACTION,
  UUID_DELIVERY,
  UUID_NOTIFICATION,
  UUID_REVIEW,
  UUID_NONEXISTENT,
  UUID_OTHER,
};