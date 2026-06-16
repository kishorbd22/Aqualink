/**
 * Aqualink - Routes
 * 
 * API route definitions.
 * Mounts all feature route groups under /api.
 */

const express = require('express');
const router = express.Router();
const { healthCheck } = require('../controllers');
const authRoutes = require('./auth');
const listingRoutes = require('./listing');
const orderRoutes = require('./order');
const transactionRoutes = require('./transaction');
const deliveryRoutes = require('./delivery');

// Health check endpoint
router.get('/health', healthCheck);

// Auth routes — POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
router.use('/auth', authRoutes);

// Listing routes — CRUD for fish listings
router.use('/listings', listingRoutes);

// Order routes — CRUD for purchase orders
router.use('/orders', orderRoutes);

// Transaction routes — CRUD for payment transactions
router.use('/transactions', transactionRoutes);

// Delivery routes — CRUD for order deliveries
router.use('/deliveries', deliveryRoutes);

module.exports = router;
