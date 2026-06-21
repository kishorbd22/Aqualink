/**
 * Aqualink - Auth Controller
 *
 * Request handlers for authentication endpoints.
 */

const authService = require('../services/authService');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/auth/register
 * Register a new user.
 */
const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !password || !role) {
      throw new ValidationError('Name, phone, email, and password are required.');
    }

    const result = await authService.register({ name, phone, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate an existing user.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };