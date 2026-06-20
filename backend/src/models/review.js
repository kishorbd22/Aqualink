/**
 * Aqualink - Review Model
 *
 * Represents a rating and feedback for a delivered order.
 *
 * Fields:
 *   id        - UUID primary key (auto-generated)
 *   orderId   - UUID foreign key → orders.id (unique, one review per order)
 *   buyerId   - UUID foreign key → users.id (the buyer who wrote the review)
 *   fisherId  - UUID foreign key → users.id (the fisher being reviewed)
 *   rating    - Integer (1–5)
 *   comment   - Optional text feedback
 *
 * Associations:
 *   Review belongsTo Order
 *   Review belongsTo User (as 'buyer')
 *   Review belongsTo User (as 'fisher')
 *   Order hasOne Review
 *   User hasMany Review (as 'buyerReviews')
 *   User hasMany Review (as 'fisherReviews')
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Model associations.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      Review.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
      });

      Review.belongsTo(models.User, {
        foreignKey: 'buyerId',
        as: 'buyer',
        onDelete: 'CASCADE',
      });

      Review.belongsTo(models.User, {
        foreignKey: 'fisherId',
        as: 'fisher',
        onDelete: 'CASCADE',
      });
    }
  }

  Review.init(
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
          notEmpty: { msg: 'Order ID is required.' },
        },
      },
      buyerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'buyer_id',
        references: {
          model: 'users',
          key: 'id',
        },
        validate: {
          notEmpty: { msg: 'Buyer ID is required.' },
        },
      },
      fisherId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'fisher_id',
        references: {
          model: 'users',
          key: 'id',
        },
        validate: {
          notEmpty: { msg: 'Fisher ID is required.' },
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Rating must be an integer.' },
          min: {
            args: [1],
            msg: 'Rating must be at least 1.',
          },
          max: {
            args: [5],
            msg: 'Rating must be at most 5.',
          },
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 2000],
            msg: 'Comment must not exceed 2000 characters.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Review',
      tableName: 'reviews',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    }
  );

  return Review;
};