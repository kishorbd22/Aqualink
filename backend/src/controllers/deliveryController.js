/**
 * Aqualink - Delivery Controller
 *
 * Request handlers for delivery CRUD and status management endpoints.
 */

const deliveryService = require('../services/deliveryService');

/**
 * POST /api/deliveries
 * Create a new delivery for an order. Requires authentication (fisher or admin role).
 */
const createDelivery = async (req, res, next) => {
  try {
    const { orderId, transporterId } = req.body;

    const delivery = await deliveryService.createDelivery(
      orderId,
      transporterId,
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully.',
      data: { delivery },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/deliveries
 * Get all deliveries scoped to the authenticated user's permissions.
 */
const getDeliveries = async (req, res, next) => {
  try {
    const deliveries = await deliveryService.getDeliveries(req.user);

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: { deliveries },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/deliveries/:id
 * Get a single delivery by ID.
 */
const getDeliveryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryService.getDeliveryById(id, req.user);

    res.status(200).json({
      success: true,
      data: { delivery },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/deliveries/:id/status
 * Update delivery status. Transporter or admin can perform this action.
 */
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const delivery = await deliveryService.updateDeliveryStatus(id, status, req.user);

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully.',
      data: { delivery },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
};