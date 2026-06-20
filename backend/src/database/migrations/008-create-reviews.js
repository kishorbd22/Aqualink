/**
 * Aqualink - Create Reviews Table Migration
 *
 * Creates the `reviews` table for order rating and feedback.
 *
 * Fields:
 *   - id              UUID primary key (auto-generated via uuid-ossp)
 *   - order_id        UUID foreign key to orders table, NOT NULL, UNIQUE (one review per order)
 *   - buyer_id        UUID foreign key to users table, NOT NULL
 *   - fisher_id       UUID foreign key to users table, NOT NULL
 *   - rating          INTEGER (1–5), NOT NULL
 *   - comment         TEXT, optional
 *   - created_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the reviews table.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the reviews table
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      fisher_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('reviews', ['order_id'], {
      name: 'reviews_order_id_index',
      unique: true,
    });
    await queryInterface.addIndex('reviews', ['buyer_id'], {
      name: 'reviews_buyer_id_index',
    });
    await queryInterface.addIndex('reviews', ['fisher_id'], {
      name: 'reviews_fisher_id_index',
    });
    await queryInterface.addIndex('reviews', ['rating'], {
      name: 'reviews_rating_index',
    });

    console.log('  ✓ Reviews table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the reviews table
    await queryInterface.dropTable('reviews');

    console.log('  ✓ Reviews table dropped');
  },
};