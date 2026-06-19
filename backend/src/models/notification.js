/**
 * Aqualink - Notification Model
 *
 * Represents an in-app notification for a user.
 *
 * Fields:
 *   id        - UUID primary key (auto-generated)
 *   userId    - UUID foreign key → users.id
 *   title     - Notification title (max 255 chars)
 *   message   - Notification body text
 *   type      - Enum: order | payment | delivery | inventory | system
 *   isRead    - Boolean flag indicating whether the user has read the notification
 *
 * Associations:
 *   Notification belongsTo User (as 'user')
 *   User hasMany Notification (as 'notifications')
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Model associations.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Title is required.' },
          len: {
            args: [1, 255],
            msg: 'Title must be between 1 and 255 characters.',
          },
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Message is required.' },
        },
      },
      type: {
        type: DataTypes.ENUM('order', 'payment', 'delivery', 'inventory', 'system'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['order', 'payment', 'delivery', 'inventory', 'system']],
            msg: 'Type must be one of: order, payment, delivery, inventory, system.',
          },
        },
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read',
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    }
  );

  return Notification;
};