/**
 * Aqualink - Create Transactions Table Migration
 *
 * Creates the `transactions` table for managing payment records.
 *
 * Fields:
 *   - id                    UUID primary key (auto-generated via uuid-ossp)
 *   - order_id              UUID foreign key to orders table, NOT NULL (unique)
 *   - amount                DECIMAL(10,2), NOT NULL
 *   - payment_method        ENUM('upi','card','cash'), NOT NULL
 *   - payment_status        ENUM('pending','paid','failed','refunded'), default 'pending'
 *   - settlement_status     ENUM('pending','settled'), default 'pending'
 *   - transaction_reference STRING, nullable
 *   - created_at            TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at            TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the transactions table and the ENUM types.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM types
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_transactions_payment_method" AS ENUM ('upi', 'card', 'cash');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_transactions_payment_status" AS ENUM ('pending', 'paid', 'failed', 'refunded');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_transactions_settlement_status" AS ENUM ('pending', 'settled');
    `);

    // Create the transactions table
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // One transaction per order
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: 'enum_transactions_payment_method',
        allowNull: false,
      },
      payment_status: {
        type: 'enum_transactions_payment_status',
        allowNull: false,
        defaultValue: 'pending',
      },
      settlement_status: {
        type: 'enum_transactions_settlement_status',
        allowNull: false,
        defaultValue: 'pending',
      },
      transaction_reference: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // Create indexes for common query patterns
    await queryInterface.addIndex('transactions', ['order_id'], {
      name: 'transactions_order_id_index',
    });
    await queryInterface.addIndex('transactions', ['payment_status'], {
      name: 'transactions_payment_status_index',
    });
    await queryInterface.addIndex('transactions', ['settlement_status'], {
      name: 'transactions_settlement_status_index',
    });

    console.log('  ✓ Transactions table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the transactions table
    await queryInterface.dropTable('transactions');

    // Drop the ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_transactions_payment_method";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_transactions_payment_status";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_transactions_settlement_status";
    `);

    console.log('  ✓ Transactions table dropped');
  },
};