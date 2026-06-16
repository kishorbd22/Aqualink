/**
 * Aqualink - Transaction Model
 *
 * Represents a payment transaction for an order.
 *
 * Fields:
 *   id                    - UUID primary key (auto-generated)
 *   orderId               - UUID foreign key → orders.id (unique)
 *   amount                - Total amount from the order (DECIMAL 10,2)
 *   paymentMethod         - Enum: upi | card | cash
 *   paymentStatus         - Enum: pending | paid | failed | refunded
 *   settlementStatus      - Enum: pending | settled
 *   transactionReference  - Optional external reference string
 *
 * Associations:
 *   Transaction belongsTo Order
 *   Order hasOne Transaction
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Model associations.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      Transaction.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
      });
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'order_id',
        references: {
          model: 'orders',
          key: 'id',
        },
        validate: {
          isUUID: { args: [4], msg: 'orderId must be a valid UUID.' },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'amount',
        validate: {
          isDecimal: { msg: 'Amount must be a decimal number.' },
          min: {
            args: [0.01],
            msg: 'Amount must be greater than 0.',
          },
        },
      },
      paymentMethod: {
        type: DataTypes.ENUM('upi', 'card', 'cash'),
        allowNull: false,
        field: 'payment_method',
        validate: {
          isIn: {
            args: [['upi', 'card', 'cash']],
            msg: 'Payment method must be one of: upi, card, cash.',
          },
        },
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'payment_status',
        validate: {
          isIn: {
            args: [['pending', 'paid', 'failed', 'refunded']],
            msg: 'Payment status must be one of: pending, paid, failed, refunded.',
          },
        },
      },
      settlementStatus: {
        type: DataTypes.ENUM('pending', 'settled'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'settlement_status',
        validate: {
          isIn: {
            args: [['pending', 'settled']],
            msg: 'Settlement status must be one of: pending, settled.',
          },
        },
      },
      transactionReference: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'transaction_reference',
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    }
  );

  return Transaction;
};