/**
 * Aqualink - Joi Validation Schemas
 *
 * Centralized request validation schemas for every resource.
 * Removes duplicated manual validation from controllers.
 * All schemas produce consistent error messages on HTTP 400.
 */

const Joi = require('joi');

// ──────────────────────────────────────────────
//  UUID helper
// ──────────────────────────────────────────────
const uuid = Joi.string().uuid({ version: 'uuidv4' });

// ──────────────────────────────────────────────
//  Authentication
// ──────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Name is required.',
    'any.required': 'Name is required.',
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-().]{7,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number is not valid.',
      'any.required': 'Phone number is required.',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email address is not valid.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.min': 'Password must be at least 6 characters.',
    'any.required': 'Password is required.',
  }),
  role: Joi.string()
    .valid('fisher', 'buyer', 'transporter')
    .required()
    .messages({
      'any.only': 'Role must be one of: fisher, buyer, transporter.',
      'any.required': 'Role is required.',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email address is not valid.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
  }),
});

// ──────────────────────────────────────────────
//  Listings
// ──────────────────────────────────────────────
const createListingSchema = Joi.object({
  species: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Species is required.',
    'any.required': 'Species is required.',
  }),
  weight: Joi.number().positive().required().messages({
    'number.base': 'Weight must be a number.',
    'number.positive': 'Weight must be greater than 0.',
    'any.required': 'Weight is required.',
  }),
  pricePerKg: Joi.number().positive().required().messages({
    'number.base': 'Price per kg must be a number.',
    'number.positive': 'Price per kg must be greater than 0.',
    'any.required': 'Price per kg is required.',
  }),
  freshnessTimestamp: Joi.date().iso().required().messages({
    'date.format': 'Freshness timestamp must be a valid ISO date.',
    'any.required': 'Freshness timestamp is required.',
  }),
  photoUrl: Joi.string().uri().allow(null, '').optional().messages({
    'string.uri': 'Photo URL must be a valid URL.',
  }),
});

const updateListingSchema = Joi.object({
  species: Joi.string().min(1).max(255).optional(),
  weight: Joi.number().positive().optional(),
  pricePerKg: Joi.number().positive().optional(),
  freshnessTimestamp: Joi.date().iso().optional(),
  status: Joi.string()
    .valid('available', 'reserved', 'sold', 'expired')
    .optional(),
  photoUrl: Joi.string().uri().allow(null, '').optional(),
}).min(1).messages({
  'object.min': 'No valid fields provided for update.',
});

// ──────────────────────────────────────────────
//  Orders
// ──────────────────────────────────────────────
const createOrderSchema = Joi.object({
  listingId: uuid.required().messages({
    'string.guid': 'listingId must be a valid UUID.',
    'any.required': 'listingId is required.',
  }),
  quantityKg: Joi.number().positive().required().messages({
    'number.base': 'Quantity must be a number.',
    'number.positive': 'Quantity must be greater than 0.',
    'any.required': 'Quantity is required.',
  }),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'delivered')
    .required()
    .messages({
      'any.only':
        'Status must be one of: accepted, rejected, delivered.',
      'any.required': 'Status is required.',
    }),
});

// ──────────────────────────────────────────────
//  Transactions
// ──────────────────────────────────────────────
const createTransactionSchema = Joi.object({
  orderId: uuid.required().messages({
    'string.guid': 'orderId must be a valid UUID.',
    'any.required': 'orderId is required.',
  }),
  paymentMethod: Joi.string()
    .valid('upi', 'card', 'cash')
    .required()
    .messages({
      'any.only': 'Payment method must be one of: upi, card, cash.',
      'any.required': 'Payment method is required.',
    }),
});

const markAsPaidSchema = Joi.object({
  reference: Joi.string().required().messages({
    'any.required': 'Payment reference is required.',
  }),
});

// ──────────────────────────────────────────────
//  Deliveries
// ──────────────────────────────────────────────
const createDeliverySchema = Joi.object({
  orderId: uuid.required().messages({
    'string.guid': 'orderId must be a valid UUID.',
    'any.required': 'orderId is required.',
  }),
  transporterId: uuid.required().messages({
    'string.guid': 'transporterId must be a valid UUID.',
    'any.required': 'transporterId is required.',
  }),
});

const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string()
    .valid('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only':
        'Status must be one of: assigned, picked_up, in_transit, delivered, cancelled.',
      'any.required': 'Status is required.',
    }),
});

// ──────────────────────────────────────────────
//  Notifications
// ──────────────────────────────────────────────
const createNotificationSchema = Joi.object({
  userId: uuid.required().messages({
    'string.guid': 'userId must be a valid UUID.',
    'any.required': 'userId is required.',
  }),
  title: Joi.string().min(1).required().messages({
    'string.empty': 'Title is required.',
    'any.required': 'Title is required.',
  }),
  message: Joi.string().min(1).required().messages({
    'string.empty': 'Message is required.',
    'any.required': 'Message is required.',
  }),
  type: Joi.string()
    .valid('order', 'payment', 'delivery', 'inventory', 'system')
    .required()
    .messages({
      'any.only':
        'Type must be one of: order, payment, delivery, inventory, system.',
      'any.required': 'Type is required.',
    }),
});

// ──────────────────────────────────────────────
//  Reviews
// ──────────────────────────────────────────────
const createReviewSchema = Joi.object({
  orderId: uuid.required().messages({
    'string.guid': 'orderId must be a valid UUID.',
    'any.required': 'orderId is required.',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be an integer between 1 and 5.',
    'number.integer': 'Rating must be an integer between 1 and 5.',
    'number.min': 'Rating must be an integer between 1 and 5.',
    'number.max': 'Rating must be an integer between 1 and 5.',
    'any.required': 'Rating is required.',
  }),
  comment: Joi.string().allow(null, '').optional(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Rating must be an integer between 1 and 5.',
    'number.integer': 'Rating must be an integer between 1 and 5.',
    'number.min': 'Rating must be an integer between 1 and 5.',
    'number.max': 'Rating must be an integer between 1 and 5.',
  }),
  comment: Joi.string().allow(null, '').optional(),
}).min(1).messages({
  'object.min': 'Provide at least rating or comment to update.',
});

// ──────────────────────────────────────────────
//  ID parameter validation
// ──────────────────────────────────────────────
const idParamSchema = Joi.object({
  id: uuid.required().messages({
    'string.guid': 'ID must be a valid UUID.',
    'any.required': 'ID parameter is required.',
  }),
});

const fisherIdParamSchema = Joi.object({
  fisherId: uuid.required().messages({
    'string.guid': 'fisherId must be a valid UUID.',
    'any.required': 'fisherId parameter is required.',
  }),
});

// ──────────────────────────────────────────────
//  Dashboard query parameters (pagination-ish)
// ──────────────────────────────────────────────
const dashboardQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
});

module.exports = {
  // Auth
  registerSchema,
  loginSchema,
  // Listings
  createListingSchema,
  updateListingSchema,
  // Orders
  createOrderSchema,
  updateOrderStatusSchema,
  // Transactions
  createTransactionSchema,
  markAsPaidSchema,
  // Deliveries
  createDeliverySchema,
  updateDeliveryStatusSchema,
  // Notifications
  createNotificationSchema,
  // Reviews
  createReviewSchema,
  updateReviewSchema,
  // Params
  idParamSchema,
  fisherIdParamSchema,
  // Dashboard
  dashboardQuerySchema,
};