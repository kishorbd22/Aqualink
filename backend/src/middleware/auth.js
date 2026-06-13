/**
 * Aqualink - Auth Middleware
 *
 * JWT verification middleware.
 * Attaches the authenticated user to `req.user`.
 */

const jwt = require('jsonwebtoken');
const { models } = require('../models');
const { AuthenticationError, ForbiddenError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'aqualink-dev-secret-change-in-production';

/**
 * Verify that the request has a valid JWT token.
 * Extracts user from token and attaches to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the user to ensure they still exist
    const user = await models.User.findByPk(decoded.id);
    if (!user) {
      throw new AuthenticationError('User no longer exists.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token has expired.'));
    }
    next(error);
  }
};

/**
 * Restrict access to specific roles.
 * Must be used after `authenticate` middleware.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'fisher')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}.`)
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };