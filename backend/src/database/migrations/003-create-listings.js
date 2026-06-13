/**
 * Aqualink - Create Listings Table Migration
 *
 * Creates the `listings` table for fish inventory management.
 *
 * Fields:
 *   - id              UUID primary key (auto-generated via uuid-ossp)
 *   - fisher_id       UUID foreign key to users table, NOT NULL
 *   - species         VARCHAR(255), NOT NULL
 *   - weight          DECIMAL(10,2), NOT NULL
 *   - price_per_kg    DECIMAL(10,2), NOT NULL
 *   - freshness_timestamp TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - status          ENUM('available','reserved','sold','expired'), default 'available'
 *   - photo_url       VARCHAR(500), nullable
 *   - created_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *   - updated_at      TIMESTAMP WITH TIME ZONE, NOT NULL
 *
 * Rollback drops the listings table and the ENUM type.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the ENUM type for listing status
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_listings_status" AS ENUM ('available', 'reserved', 'sold', 'expired');
    `);

    // Create the listings table
    await queryInterface.createTable('listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
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
      species: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      price_per_kg: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      freshness_timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: 'enum_listings_status',
        allowNull: false,
        defaultValue: 'available',
      },
      photo_url: {
        type: Sequelize.STRING(500),
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
    await queryInterface.addIndex('listings', ['fisher_id'], {
      name: 'listings_fisher_id_index',
    });
    await queryInterface.addIndex('listings', ['status'], {
      name: 'listings_status_index',
    });
    await queryInterface.addIndex('listings', ['species'], {
      name: 'listings_species_index',
    });
    await queryInterface.addIndex('listings', ['freshness_timestamp'], {
      name: 'listings_freshness_timestamp_index',
    });

    console.log('  ✓ Listings table created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the listings table
    await queryInterface.dropTable('listings');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_listings_status";
    `);

    console.log('  ✓ Listings table dropped');
  },
};