/**
 * Aqualink - Dashboard Service
 *
 * Business logic for role-based dashboard analytics.
 * Uses aggregate Sequelize queries (COUNT, SUM, AVG) across
 * Users, Listings, Orders, Transactions, Deliveries, and Reviews tables.
 */
const { sequelize, models } = require('../models');

/**
 * Get global platform statistics for admin.
 * @returns {Object} Platform-wide aggregate data
 */
const getAdminDashboard = async () => {
  const [
    userStats,
    listingStats,
    orderStats,
    transactionStats,
    deliveryStats,
    reviewStats,
    revenueResult,
  ] = await Promise.all([
    // Users grouped by role
    models.User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['role'],
      raw: true,
    }),

    // Listings grouped by status
    models.Listing.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),

    // Orders grouped by status
    models.Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),

    // Transactions grouped by payment status
    models.Transaction.findAll({
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['paymentStatus'],
      raw: true,
    }),

    // Deliveries grouped by status
    models.Delivery.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),

    // Reviews aggregate
    models.Review.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      ],
      raw: true,
    }),

    // Total revenue from paid transactions
    models.Transaction.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
      ],
      where: { paymentStatus: 'paid' },
      raw: true,
    }),
  ]);

  return {
    users: userStats,
    listings: listingStats,
    orders: orderStats,
    transactions: transactionStats,
    deliveries: deliveryStats,
    reviews: reviewStats,
    revenue: revenueResult,
  };
};

/**
 * Get dashboard statistics for a fisher.
 * @param {string} fisherId - The authenticated fisher's UUID
 * @returns {Object} Fisher-specific aggregate data
 */
const getFisherDashboard = async (fisherId) => {
  const [listingStats, orderStats, revenueResult, ratingResult] =
    await Promise.all([
      // Listings grouped by status
      models.Listing.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { fisherId },
        group: ['status'],
        raw: true,
      }),

      // Orders on fisher's listings grouped by status
      models.Order.findAll({
        attributes: [
          [sequelize.col('Order.status'), 'status'],
          [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count'],
        ],
        include: [
          {
            model: models.Listing,
            as: 'listing',
            attributes: [],
            where: { fisherId },
          },
        ],
        group: ['Order.status'],
        raw: true,
      }),

      // Total revenue from orders on fisher's listings (paid transactions)
      models.Transaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
        ],
        include: [
          {
            model: models.Order,
            as: 'order',
            attributes: [],
            include: [
              {
                model: models.Listing,
                as: 'listing',
                attributes: [],
                where: { fisherId },
              },
            ],
          },
        ],
        where: { paymentStatus: 'paid' },
        raw: true,
      }),

      // Average rating and total reviews received
      models.Review.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        ],
        where: { fisherId },
        raw: true,
      }),
    ]);

  return {
    listings: listingStats,
    orders: orderStats,
    revenue: revenueResult,
    ratings: ratingResult,
  };
};

/**
 * Get dashboard statistics for a buyer.
 * @param {string} buyerId - The authenticated buyer's UUID
 * @returns {Object} Buyer-specific aggregate data
 */
const getBuyerDashboard = async (buyerId) => {
  const [orderStats, spendingResult, transactionStats, reviewStats] =
    await Promise.all([
      // Orders grouped by status
      models.Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { buyerId },
        group: ['status'],
        raw: true,
      }),

      // Total spending (sum of totalPrice on orders)
      models.Order.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total_price')), 'totalSpending'],
        ],
        where: { buyerId },
        raw: true,
      }),

      // Transactions on buyer's orders grouped by payment status
      models.Transaction.findAll({
        attributes: [
          'paymentStatus',
          [sequelize.fn('COUNT', sequelize.col('Transaction.payment_status')), 'count'],
        ],
        include: [
          {
            model: models.Order,
            as: 'order',
            attributes: [],
            where: { buyerId },
          },
        ],
        group: ['Transaction.payment_status'],
        raw: true,
      }),

      // Reviews written by buyer
      models.Review.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { buyerId },
        raw: true,
      }),
    ]);

  return {
    orders: orderStats,
    spending: spendingResult,
    transactions: transactionStats,
    reviews: reviewStats,
  };
};

/**
 * Get dashboard statistics for a transporter.
 * @param {string} transporterId - The authenticated transporter's UUID
 * @returns {Object} Transporter-specific aggregate data
 */
const getTransporterDashboard = async (transporterId) => {
  const deliveryStats = await models.Delivery.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { transporterId },
    group: ['status'],
    raw: true,
  });

  return {
    deliveries: deliveryStats,
  };
};

module.exports = {
  getAdminDashboard,
  getFisherDashboard,
  getBuyerDashboard,
  getTransporterDashboard,
};