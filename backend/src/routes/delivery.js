/**
 * Aqualink - Delivery Routes
 *
 * Route definitions for delivery CRUD and status management endpoints.
 * All mounted under /api/deliveries.
 */

const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/deliveries — Create a delivery (fisher or admin only)
router.post('/', authenticate, authorize('fisher', 'admin'), deliveryController.createDelivery);

// GET /api/deliveries — Get all deliveries (authenticated users, scoped by role)
router.get('/', authenticate, deliveryController.getDeliveries);

// GET /api/deliveries/:id — Get a single delivery (authenticated users, access controlled)
router.get('/:id', authenticate, deliveryController.getDeliveryById);

// PATCH /api/deliveries/:id/status — Update delivery status (transporter or admin)
router.patch('/:id/status', authenticate, deliveryController.updateDeliveryStatus);

module.exports = router;