/**
 * Aqualink - Create Users Table Migration
 *
 * Creates the `users` table with all required fields:
 *   - id         UUID primary key (auto-generated via uuid-ossp)
 *   - name       VARCHAR(255), NOT NULL
 *   - phone      VARCHAR(20), NOT NULL, UNIQUE
 *   - email      VARCHAR(255), NOT NULL, UNIQUE
 *   - password   VARCHAR(255), NOT NULL
 *   - role       ENUM('fisher','buyer','transporter','admin'), NOT NULL, default 'buyer'
 *   - created_at TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the users table and the ENUM type.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the ENUM type for roles
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('fisher', 'buyer', 'transporter', 'admin');
    `);

    // Create the users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: 'enum_users_role',
        allowNull: false,
        defaultValue: 'buyer',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes on unique columns for better query performance
    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_unique',
      unique: true,
    });
    await queryInterface.addIndex('users', ['phone'], {
      name: 'users_phone_unique',
      unique: true,
    });

    // Create index on role for filtering queries
    await queryInterface.addIndex('users', ['role'], {
      name: 'users_role_index',
    });

    console.log('  ✓ Users table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the users table
    await queryInterface.dropTable('users');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_role";
    `);

    console.log('  ✓ Users table dropped');
  },
};