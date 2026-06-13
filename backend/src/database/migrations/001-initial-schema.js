/**
 * Aqualink - Initial Schema Migration
 *
 * Sets up the foundational database configuration:
 *   - Enables the uuid-ossp extension for UUID v4 generation
 *
 * Business tables should be added in subsequent migration files
 * (e.g., 002-create-users.js, 003-create-listings.js).
 *
 * Migration file naming convention:
 *   NNN-description.js  where NNN is a sequential number (001, 002, ...)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable UUID generation extension (required for UUID primary keys)
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    );

    console.log('  ✓ uuid-ossp extension enabled');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the extension on rollback (WARNING: this may affect other tables)
    await queryInterface.sequelize.query(
      'DROP EXTENSION IF EXISTS "uuid-ossp";'
    );

    console.log('  ✓ uuid-ossp extension disabled');
  },
};