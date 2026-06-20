/**
 * Aqualink - Dashboard Controller
 *
 * Request handlers for role-based dashboard analytics endpoints.
 */

const dashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard/admin
 * Global platform statistics. Requires admin role.
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/fisher
 * Fisher-specific listing, order, revenue, and rating statistics.
 */
const getFisherDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getFisherDashboard(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/buyer
 * Buyer-specific order, payment, and spending statistics.
 */
const getBuyerDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getBuyerDashboard(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/transporter
 * Transporter-specific delivery statistics.
 */
const getTransporterDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getTransporterDashboard(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getFisherDashboard,
  getBuyerDashboard,
  getTransporterDashboard,
};