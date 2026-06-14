/**
 * Aqualink - Create Orders Table Migration
 *
 * Creates the `orders` table for managing fish purchase orders.
 *
 * Fields:
 *   - id              UUID primary key (auto-generated via uuid-ossp)
 *   - buyer_id        UUID foreign key to users table, NOT NULL
 *   - listing_id      UUID foreign key to listings table, NOT NULL
 *   - quantity_kg     DECIMAL(10,2), NOT NULL
 *   - total_price     DECIMAL(10,2), NOT NULL
 *   - status          ENUM('pending','accepted','rejected','delivered'), default 'pending'
 *   - created_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the orders table and the ENUM type.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the ENUM type for order status
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_orders_status" AS ENUM ('pending', 'accepted', 'rejected', 'delivered');
    `);

    // Create the orders table
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      listing_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity_kg: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: 'enum_orders_status',
        allowNull: false,
        defaultValue: 'pending',
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
    await queryInterface.addIndex('orders', ['buyer_id'], {
      name: 'orders_buyer_id_index',
    });
    await queryInterface.addIndex('orders', ['listing_id'], {
      name: 'orders_listing_id_index',
    });
    await queryInterface.addIndex('orders', ['status'], {
      name: 'orders_status_index',
    });

    console.log('  ✓ Orders table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the orders table
    await queryInterface.dropTable('orders');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_orders_status";
    `);

    console.log('  ✓ Orders table dropped');
  },
};