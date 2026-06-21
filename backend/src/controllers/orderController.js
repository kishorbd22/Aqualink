/**
 * Aqualink - Order Controller
 *
 * Request handlers for order CRUD and status management endpoints.
 */

const orderService = require('../services/orderService');

/**
 * POST /api/orders
 * Create a new order. Requires authentication (buyer role).
 */
const createOrder = async (req, res, next) => {
  try {
    const { listingId, quantityKg } = req.body;

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
 * Get all orders with optional filters, pagination, and sorting (query params).
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

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
    };

    const { orders, pagination: meta } = await orderService.getOrders(filters, req.user, pagination);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: meta,
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