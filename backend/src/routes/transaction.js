/**
 * Aqualink - Transaction Routes
 *
 * Route definitions for payment transaction CRUD and status management endpoints.
 * All mounted under /api/transactions.
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createTransactionSchema, markAsPaidSchema, idParamSchema } = require('../validations');

// POST /api/transactions — Create a transaction (buyer only)
router.post('/', authenticate, authorize('buyer'), validate(createTransactionSchema), transactionController.createTransaction);

// GET /api/transactions — Get all transactions (authenticated users, scoped by role)
router.get('/', authenticate, transactionController.getTransactions);

// GET /api/transactions/:id — Get a single transaction (authenticated users, access controlled)
router.get('/:id', authenticate, validate(idParamSchema, 'params'), transactionController.getTransactionById);

// PATCH /api/transactions/:id/pay — Mark transaction as paid (buyer or admin)
router.patch('/:id/pay', authenticate, validate(idParamSchema, 'params'), validate(markAsPaidSchema), transactionController.markAsPaid);

// PATCH /api/transactions/:id/fail — Mark transaction as failed (buyer or admin)
router.patch('/:id/fail', authenticate, transactionController.markAsFailed);

// PATCH /api/transactions/:id/refund — Refund transaction (admin only)
router.patch('/:id/refund', authenticate, authorize('admin'), transactionController.markAsRefunded);

module.exports = router;