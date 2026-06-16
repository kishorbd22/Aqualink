/**
 * Aqualink - Create Deliveries Table Migration
 *
 * Creates the `deliveries` table for managing order delivery tracking.
 *
 * Fields:
 *   - id              UUID primary key (auto-generated via uuid-ossp)
 *   - order_id        UUID foreign key to orders table, NOT NULL (unique)
 *   - transporter_id  UUID foreign key to users table, NOT NULL
 *   - pickup_time     TIMESTAMP WITH TIME ZONE, nullable
 *   - delivery_time   TIMESTAMP WITH TIME ZONE, nullable
 *   - status          ENUM('assigned','picked_up','in_transit','delivered','cancelled'), default 'assigned'
 *   - created_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the deliveries table and the ENUM type.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM type for delivery status
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_deliveries_status" AS ENUM ('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled');
    `);

    // Create the deliveries table
    await queryInterface.createTable('deliveries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // One delivery per order
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      transporter_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pickup_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivery_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: 'enum_deliveries_status',
        allowNull: false,
        defaultValue: 'assigned',
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
    await queryInterface.addIndex('deliveries', ['order_id'], {
      name: 'deliveries_order_id_index',
    });
    await queryInterface.addIndex('deliveries', ['transporter_id'], {
      name: 'deliveries_transporter_id_index',
    });
    await queryInterface.addIndex('deliveries', ['status'], {
      name: 'deliveries_status_index',
    });

    console.log('  ✓ Deliveries table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the deliveries table
    await queryInterface.dropTable('deliveries');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_deliveries_status";
    `);

    console.log('  ✓ Deliveries table dropped');
  },
};