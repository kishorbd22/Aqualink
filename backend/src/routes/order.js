/**
 * Aqualink - Order Routes
 *
 * Route definitions for order CRUD and status management endpoints.
 * All mounted under /api/orders.
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/orders — Create an order (buyer only)
router.post('/', authenticate, authorize('buyer'), orderController.createOrder);

// GET /api/orders — Get all orders (authenticated users, scoped by role)
router.get('/', authenticate, orderController.getOrders);

// GET /api/orders/:id — Get a single order (authenticated users, access controlled)
router.get('/:id', authenticate, orderController.getOrderById);

// PATCH /api/orders/:id/status — Update order status (fisher or admin)
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

module.exports = router;