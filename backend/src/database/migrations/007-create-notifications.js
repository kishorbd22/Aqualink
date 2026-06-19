/**
 * Aqualink - Create Notifications Table Migration
 *
 * Creates the `notifications` table for in-app notification management.
 *
 * Fields:
 *   - id              UUID primary key (auto-generated via uuid-osstp)
 *   - user_id         UUID foreign key to users table, NOT NULL
 *   - title           VARCHAR(255), NOT NULL
 *   - message         TEXT, NOT NULL
 *   - type            ENUM('order','payment','delivery','inventory','system'), NOT NULL
 *   - is_read         BOOLEAN, default false
 *   - created_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the notifications table and the ENUM type.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM type for notification type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_notifications_type" AS ENUM ('order', 'payment', 'delivery', 'inventory', 'system');
    `);

    // Create the notifications table
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: 'enum_notifications_type',
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('notifications', ['user_id'], {
      name: 'notifications_user_id_index',
    });
    await queryInterface.addIndex('notifications', ['is_read'], {
      name: 'notifications_is_read_index',
    });
    await queryInterface.addIndex('notifications', ['type'], {
      name: 'notifications_type_index',
    });

    console.log('  ✓ Notifications table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the notifications table
    await queryInterface.dropTable('notifications');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_notifications_type";
    `);

    console.log('  ✓ Notifications table dropped');
  },
};