/**
 * Aqualink - Database Configuration
 *
 * Provides Sequelize-compatible configuration for development, test,
 * and production environments.
 *
 * Supports both DATABASE_URL connection string and individual
 * DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD variables.
 */

require('dotenv').config();

const defaultConfig = {
  dialect: 'postgres',
  dialectOptions: {},
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
};

const environments = {
  development: {
    ...defaultConfig,
    url: process.env.DATABASE_URL || 'postgresql://aqualink:aqualink_secret@localhost:5432/aqualink',
    logging: (msg) => console.log(`[DEV DB] ${msg}`),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  test: {
    ...defaultConfig,
    url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL || 'postgresql://aqualink:aqualink_secret@localhost:5432/aqualink_test',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  production: {
    ...defaultConfig,
    url: process.env.DATABASE_URL,
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

const env = process.env.NODE_ENV || 'development';
const config = environments[env];

if (!config) {
  throw new Error(`Unknown NODE_ENV: "${env}". Supported: development, test, production.`);
}

// Fallback: build URL from individual parts if DATABASE_URL is not set
if (!config.url && process.env.DB_HOST) {
  const user = process.env.DB_USER || 'aqualink';
  const password = process.env.DB_PASSWORD || 'aqualink_secret';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const name = process.env.DB_NAME || 'aqualink';
  config.url = `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

module.exports = config;