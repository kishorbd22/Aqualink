/**
 * Aqualink - Transaction Service
 *
 * Business logic for payment transaction CRUD and status management.
 */

const { models, sequelize } = require('../models');
const { Op } = require('sequelize');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Create a new transaction for an order.
 * Only the order buyer can create a payment record.
 * One transaction per order enforced by unique constraint.
 * @param {string} orderId - UUID of the order
 * @param {string} paymentMethod - upi | card | cash
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} The created transaction with order info
 */
const createTransaction = async (orderId, paymentMethod, user) => {
  if (!orderId || !paymentMethod) {
    throw new ValidationError('orderId and paymentMethod are required.');
  }

  const validMethods = ['upi', 'card', 'cash'];
  if (!validMethods.includes(paymentMethod)) {
    throw new ValidationError(
      `Payment method must be one of: ${validMethods.join(', ')}.`
    );
  }

  // Fetch the order to verify it exists and user has access
  const order = await models.Order.findByPk(orderId, {
    include: [
      {
        model: models.Listing,
        as: 'listing',
      },
    ],
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Only the order buyer can create a transaction
  if (order.buyerId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You can only create payments for your own orders.');
  }

  // Check if a transaction already exists for this order
  const existingTransaction = await models.Transaction.findOne({
    where: { orderId },
  });

  if (existingTransaction) {
    throw new ValidationError('A transaction already exists for this order.');
  }

  // Create the transaction in a database transaction
  const transaction = await sequelize.transaction(async (t) => {
    const newTransaction = await models.Transaction.create(
      {
        orderId,
        amount: order.totalPrice,
        paymentMethod,
        paymentStatus: 'pending',
        settlementStatus: 'pending',
      },
      { transaction: t }
    );

    return newTransaction;
  });

  // Return with order association
  return await models.Transaction.findByPk(transaction.id, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            attributes: ['id', 'species', 'pricePerKg', 'weight'],
          },
        ],
      },
    ],
  });
};

/**
 * Get a single transaction by ID.
 * @param {string} id - Transaction UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Transaction with order info
 */
const getTransactionById = async (id, user) => {
  const transaction = await models.Transaction.findByPk(id, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found.');
  }

  // Check access: buyer owns the order, fisher owns the listing, or admin
  const order = transaction.order;
  const listing = order.listing;
  if (
    order.buyerId !== user.id &&
    listing.fisherId !== user.id &&
    user.role !== 'admin'
  ) {
    throw new ForbiddenError('You do not have access to this transaction.');
  }

  return transaction;
};

/**
 * Get transactions based on user role.
 * Buyers see their own transactions.
 * Fishers see transactions for orders on their listings.
 * Admins see all transactions.
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Array} List of transactions
 */
const getTransactions = async (user) => {
  const where = {};

  if (user.role === 'buyer') {
    // Buyers see transactions on their own orders
    const userOrders = await models.Order.findAll({
      where: { buyerId: user.id },
      attributes: ['id'],
    });
    const orderIds = userOrders.map((o) => o.id);
    if (orderIds.length === 0) {
      return [];
    }
    where.orderId = { [Op.in]: orderIds };
  } else if (user.role === 'fisher') {
    // Fishers see transactions for orders on their listings
    const userListings = await models.Listing.findAll({
      where: { fisherId: user.id },
      attributes: ['id'],
    });
    const listingIds = userListings.map((l) => l.id);
    if (listingIds.length === 0) {
      return [];
    }
    const listingOrders = await models.Order.findAll({
      where: { listingId: { [Op.in]: listingIds } },
      attributes: ['id'],
    });
    const orderIds = listingOrders.map((o) => o.id);
    if (orderIds.length === 0) {
      return [];
    }
    where.orderId = { [Op.in]: orderIds };
  }
  // Admins see all — no filter

  return await models.Transaction.findAll({
    where,
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Mark a transaction as paid.
 * Only pending payments can become paid.
 * @param {string} transactionId - Transaction UUID
 * @param {string} reference - Optional external transaction reference
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated transaction
 */
const markAsPaid = async (transactionId, reference, user) => {
  const transaction = await models.Transaction.findByPk(transactionId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.Listing,
            as: 'listing',
          },
        ],
      },
    ],
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found.');
  }

  // Only the order buyer or admin can mark as paid
  if (transaction.order.buyerId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to mark this payment as paid.');
  }

  if (transaction.paymentStatus !== 'pending') {
    throw new ValidationError(
      `Cannot mark transaction as paid. Current status is "${transaction.paymentStatus}". Only pending payments can become paid.`
    );
  }

  await sequelize.transaction(async (t) => {
    await transaction.update(
      {
        paymentStatus: 'paid',
        transactionReference: reference || transaction.transactionReference,
      },
      { transaction: t }
    );
  });

  // Return updated transaction
  return await models.Transaction.findByPk(transactionId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
    ],
  });
};

/**
 * Mark a transaction as failed.
 * Only pending payments can become failed.
 * @param {string} transactionId - Transaction UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated transaction
 */
const markAsFailed = async (transactionId, user) => {
  const transaction = await models.Transaction.findByPk(transactionId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.Listing,
            as: 'listing',
          },
        ],
      },
    ],
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found.');
  }

  // Only the order buyer or admin can mark as failed
  if (transaction.order.buyerId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to mark this payment as failed.');
  }

  if (transaction.paymentStatus !== 'pending') {
    throw new ValidationError(
      `Cannot mark transaction as failed. Current status is "${transaction.paymentStatus}". Only pending payments can become failed.`
    );
  }

  await sequelize.transaction(async (t) => {
    await transaction.update(
      { paymentStatus: 'failed' },
      { transaction: t }
    );
  });

  return await models.Transaction.findByPk(transactionId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
    ],
  });
};

/**
 * Mark a transaction as refunded.
 * Only paid transactions can become refunded.
 * Only admins can refund transactions.
 * @param {string} transactionId - Transaction UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated transaction
 */
const markAsRefunded = async (transactionId, user) => {
  if (user.role !== 'admin') {
    throw new ForbiddenError('Only admins can refund transactions.');
  }

  const transaction = await models.Transaction.findByPk(transactionId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.Listing,
            as: 'listing',
          },
        ],
      },
    ],
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found.');
  }

  if (transaction.paymentStatus !== 'paid') {
    throw new ValidationError(
      `Cannot refund transaction. Current status is "${transaction.paymentStatus}". Only paid transactions can become refunded.`
    );
  }

  await sequelize.transaction(async (t) => {
    await transaction.update(
      { paymentStatus: 'refunded' },
      { transaction: t }
    );
  });

  return await models.Transaction.findByPk(transactionId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
    ],
  });
};

module.exports = {
  createTransaction,
  getTransactionById,
  getTransactions,
  markAsPaid,
  markAsFailed,
  markAsRefunded,
};