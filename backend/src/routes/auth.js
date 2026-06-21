/**
 * Aqualink - Auth Routes
 *
 * Route definitions for authentication endpoints.
 * All mounted under /api/auth.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validations');

// POST /api/auth/register — Create a new account
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login — Authenticate and receive a JWT
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me — Get the current user's profile (protected)
router.get('/me', authenticate, authController.getMe);

module.exports = router;