/**
 * Aqualink - Sequelize Initialization
 *
 * Creates and exports a configured Sequelize instance.
 * Also exports a testConnection() helper for startup verification.
 *
 * Usage:
 *   const { sequelize } = require('../database');
 *   // or from models directory:
 *   const { sequelize, models } = require('../models');
 */

const { Sequelize } = require('sequelize');
const config = require('./config');

/**
 * Sequelize instance configured from environment variables.
 * Uses DATABASE_URL (or individual DB_* variables) via ./config.js.
 */
const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  logging: config.logging,
  pool: config.pool,
  dialectOptions: config.dialectOptions,
  define: {
    // Default model options applied to all models
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
});

/**
 * Verify the database connection.
 * Call this during application startup after the server starts.
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL connection established successfully.');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to PostgreSQL:', error.message);
    throw error;
  }
};

/**
 * Close the database connection gracefully.
 * Call this during shutdown (SIGTERM, SIGINT).
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✓ PostgreSQL connection closed.');
  } catch (error) {
    console.error('✗ Error closing PostgreSQL connection:', error.message);
  }
};

module.exports = { sequelize, testConnection, closeConnection };