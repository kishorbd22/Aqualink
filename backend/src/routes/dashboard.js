/**
 * Aqualink - Dashboard Routes
 *
 * Route definitions for role-based dashboard analytics endpoints.
 * All mounted under /api/dashboard.
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { dashboardQuerySchema } = require('../validations');

// GET /api/dashboard/admin — Global platform statistics (admin only)
router.get('/admin', authenticate, authorize('admin'), validate(dashboardQuerySchema), dashboardController.getAdminDashboard);

// GET /api/dashboard/fisher — Fisher-specific statistics
router.get('/fisher', authenticate, authorize('fisher'), validate(dashboardQuerySchema), dashboardController.getFisherDashboard);

// GET /api/dashboard/buyer — Buyer-specific statistics
router.get('/buyer', authenticate, authorize('buyer'), validate(dashboardQuerySchema), dashboardController.getBuyerDashboard);

// GET /api/dashboard/transporter — Transporter-specific statistics
router.get('/transporter', authenticate, authorize('transporter'), validate(dashboardQuerySchema), dashboardController.getTransporterDashboard);

module.exports = router;