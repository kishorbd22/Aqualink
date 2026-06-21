/**
 * Aqualink - Transaction Controller
 *
 * Request handlers for payment transaction CRUD and status management endpoints.
 */

const transactionService = require('../services/transactionService');

/**
 * POST /api/transactions
 * Create a new transaction for an order. Requires authentication (buyer role).
 */
const createTransaction = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;

    const transaction = await transactionService.createTransaction(
      orderId,
      paymentMethod,
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions
 * Get all transactions scoped to the authenticated user's permissions.
 */
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getTransactions(req.user);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID.
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(id, req.user);

    res.status(200).json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/transactions/:id/pay
 * Mark a transaction as paid. Buyer or admin can perform this action.
 */
const markAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reference } = req.body;

    const transaction = await transactionService.markAsPaid(id, reference, req.user);

    res.status(200).json({
      success: true,
      message: 'Transaction marked as paid successfully.',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/transactions/:id/fail
 * Mark a transaction as failed. Buyer or admin can perform this action.
 */
const markAsFailed = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.markAsFailed(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Transaction marked as failed successfully.',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/transactions/:id/refund
 * Mark a transaction as refunded. Only admin can perform this action.
 */
const markAsRefunded = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.markAsRefunded(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Transaction refunded successfully.',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  markAsPaid,
  markAsFailed,
  markAsRefunded,
};