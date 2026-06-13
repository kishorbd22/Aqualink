/**
 * Aqualink - Backend Application
 *
 * Main application entry point.
 * Express server listening on port 5000.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const { AppError } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Hello world route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AquaLink API' });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log the error
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // Operational errors (known, expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        type: err.name,
      },
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(' '),
        type: 'ValidationError',
      },
    });
  }

  // Unknown errors — don't leak details in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error.'
    : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      type: 'InternalServerError',
    },
  });
});

// Unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`AquaLink backend is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

module.exports = app;
