/**
 * Aqualink - Delivery Model
 *
 * Represents a delivery record for an order.
 *
 * Fields:
 *   id             - UUID primary key (auto-generated)
 *   orderId        - UUID foreign key → orders.id
 *   transporterId  - UUID foreign key → users.id
 *   pickupTime     - Timestamp when the delivery was picked up
 *   deliveryTime   - Timestamp when the delivery was completed
 *   status         - Enum: assigned | picked_up | in_transit | delivered | cancelled
 *
 * Associations:
 *   Delivery belongsTo Order (as 'order')
 *   Delivery belongsTo User (as 'transporter')
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    /**
     * Model associations.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      Delivery.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
      });

      Delivery.belongsTo(models.User, {
        foreignKey: 'transporterId',
        as: 'transporter',
        onDelete: 'CASCADE',
      });
    }
  }

  Delivery.init(
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
      },
      transporterId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'transporter_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      pickupTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'pickup_time',
      },
      deliveryTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'delivery_time',
      },
      status: {
        type: DataTypes.ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'assigned',
        validate: {
          isIn: {
            args: [['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled']],
            msg: 'Status must be one of: assigned, picked_up, in_transit, delivered, cancelled.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Delivery',
      tableName: 'deliveries',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    }
  );

  return Delivery;
};