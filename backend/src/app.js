/**
 * Aqualink - Backend Application
 *
 * Main application entry point.
 * Express server listening on port 5000.
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
require('dotenv').config();

const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const { AppError } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);

const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
const corsCredentials = (process.env.CORS_CREDENTIALS || 'true').toLowerCase() === 'true';
app.use(
  cors({
    origin: corsOrigin,
    credentials: corsCredentials,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Parameter Pollution protection
app.use(hpp());

// Compression
app.use(compression());

// Rate limiting
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const trustProxy = (process.env.RATE_LIMIT_TRUST_PROXY || 'false').toLowerCase() === 'true';

if (trustProxy) {
  app.set('trust proxy', 1);
}

const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'AquaLink API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

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

// Only start the server when this file is run directly (not when imported by tests)
if (require.main === module) {
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
}

module.exports = app;
