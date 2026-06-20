/**
 * Aqualink - Order Model
 *
 * Represents a purchase order for a fish listing.
 *
 * Fields:
 *   id          - UUID primary key (auto-generated)
 *   buyerId     - UUID foreign key → users.id
 *   listingId   - UUID foreign key → listings.id
 *   quantityKg  - Quantity ordered in kilograms
 *   totalPrice  - Total price calculated as listing.pricePerKg * quantityKg
 *   status      - Enum: pending | accepted | rejected | delivered
 *
 * Associations:
 *   Order belongsTo User (as 'buyer')
 *   Order belongsTo Listing
 *   User hasMany Order (as 'buyerOrders')
 *   Listing hasMany Order
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Model associations.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'buyerId',
        as: 'buyer',
        onDelete: 'CASCADE',
      });

      Order.belongsTo(models.Listing, {
        foreignKey: 'listingId',
        as: 'listing',
        onDelete: 'CASCADE',
      });

      Order.hasOne(models.Transaction, {
        foreignKey: 'orderId',
        as: 'transaction',
        onDelete: 'CASCADE',
      });

      Order.hasOne(models.Delivery, {
        foreignKey: 'orderId',
        as: 'delivery',
        onDelete: 'CASCADE',
      });

      Order.hasOne(models.Review, {
        foreignKey: 'orderId',
        as: 'review',
        onDelete: 'CASCADE',
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      buyerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'buyer_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      listingId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'listing_id',
        references: {
          model: 'listings',
          key: 'id',
        },
      },
      quantityKg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'quantity_kg',
        validate: {
          isDecimal: { msg: 'Quantity must be a decimal number.' },
          min: {
            args: [0.01],
            msg: 'Quantity must be greater than 0.',
          },
        },
      },
      totalPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_price',
        validate: {
          isDecimal: { msg: 'Total price must be a decimal number.' },
          min: {
            args: [0],
            msg: 'Total price must be a positive value.',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'delivered'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'accepted', 'rejected', 'delivered']],
            msg: 'Status must be one of: pending, accepted, rejected, delivered.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    }
  );

  return Order;
};