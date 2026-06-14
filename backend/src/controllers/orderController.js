/**
 * Aqualink - Order Controller
 *
 * Request handlers for order CRUD and status management endpoints.
 */

const orderService = require('../services/orderService');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/orders
 * Create a new order. Requires authentication (buyer role).
 */
const createOrder = async (req, res, next) => {
  try {
    const { listingId, quantityKg } = req.body;

    if (!listingId || !quantityKg) {
      throw new ValidationError('listingId and quantityKg are required.');
    }

    const order = await orderService.createOrder(
      { listingId, quantityKg },
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Get all orders with optional filters (query params).
 * Results are scoped to the authenticated user's permissions.
 */
const getOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      buyerId: req.query.buyerId,
      listingId: req.query.listingId,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) delete filters[key];
    });

    const orders = await orderService.getOrders(filters, req.user);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID.
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user);

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order. Only the listing owner (fisher) or admin can update.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError('Status is required.');
    }

    const order = await orderService.updateOrderStatus(id, status, req.user);

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}" successfully.`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};