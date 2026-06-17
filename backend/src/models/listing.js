/**
 * Aqualink - Listing Model
 *
 * Represents a fish inventory listing posted by a fisher.
 *
 * Fields:
 *   id                  - UUID primary key (auto-generated)
 *   fisherId            - UUID foreign key → users.id
 *   species             - Name of the fish species
 *   weight              - Weight in kg
 *   pricePerKg          - Price per kilogram
 *   freshnessTimestamp  - When the catch was made
 *   status              - Enum: available | reserved | sold | expired
 *   photoUrl            - Optional image URL
 *
 * Associations:
 *   Listing belongsTo User (as 'fisher')
 *   User hasMany Listing
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Listing extends Model {
    /**
     * Model associations.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      Listing.belongsTo(models.User, {
        foreignKey: 'fisherId',
        as: 'fisher',
        onDelete: 'CASCADE',
      });

      Listing.hasMany(models.Order, {
        foreignKey: 'listingId',
        as: 'orders',
        onDelete: 'CASCADE',
      });
    }
  }

  Listing.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fisherId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'fisher_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      species: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Species is required.' },
          len: {
            args: [1, 255],
            msg: 'Species must be between 1 and 255 characters.',
          },
        },
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: { msg: 'Weight must be a decimal number.' },
          min: {
            args: [0],
            msg: 'Weight must be greater than 0.',
          },
        },
      },
      pricePerKg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_per_kg',
        validate: {
          isDecimal: { msg: 'Price per kg must be a decimal number.' },
          min: {
            args: [0],
            msg: 'Price per kg must be greater than 0.',
          },
        },
      },
      freshnessTimestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'freshness_timestamp',
        validate: {
          isDate: { msg: 'Freshness timestamp must be a valid date.' },
        },
      },
      status: {
        type: DataTypes.ENUM('available', 'reserved', 'sold', 'expired'),
        allowNull: false,
        defaultValue: 'available',
        validate: {
          isIn: {
            args: [['available', 'reserved', 'sold', 'expired']],
            msg: 'Status must be one of: available, reserved, sold, expired.',
          },
        },
      },
      photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'photo_url',
        validate: {
          isUrl: { msg: 'Photo URL must be a valid URL.' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Listing',
      tableName: 'listings',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    }
  );

  return Listing;
};