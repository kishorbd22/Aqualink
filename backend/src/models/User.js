/**
 * Aqualink - User Model
 *
 * Represents a platform user (fisher, buyer, transporter, admin).
 *
 * Fields:
 *   id         - UUID primary key (auto-generated)
 *   name       - Full name of the user
 *   phone      - Unique phone number
 *   email      - Unique email address
 *   password   - Hashed password (excluded from default queries)
 *   role       - Enum: fisher | buyer | transporter | admin
 *
 * Scopes:
 *   default    - Excludes the password field
 *   withPassword - Includes the password field (for auth flows)
 *
 * Associations (placeholder):
 *   User hasMany Listing      — listings owned by the user
 *   User hasMany Transaction  — transactions the user participated in
 *   User hasMany Review       — reviews written by the user
 */

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Model associations placeholder.
     * Called automatically by the model loader (models/index.js).
     */
    static associate(models) {
      // A fisher can have many listings
      User.hasMany(models.Listing, {
        foreignKey: 'fisherId',
        as: 'listings',
        onDelete: 'CASCADE',
      });

      // A buyer can have many orders
      User.hasMany(models.Order, {
        foreignKey: 'buyerId',
        as: 'buyerOrders',
        onDelete: 'CASCADE',
      });

      // A transporter can have many deliveries
      User.hasMany(models.Delivery, {
        foreignKey: 'transporterId',
        as: 'deliveries',
        onDelete: 'CASCADE',
      });

      // A user can have many notifications
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications',
        onDelete: 'CASCADE',
      });

      // TODO: Uncomment once Review model exists
      // User.hasMany(models.Review, {
      //   foreignKey: 'reviewer_id',
      //   as: 'reviews',
      // });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required.' },
          len: {
            args: [1, 255],
            msg: 'Name must be between 1 and 255 characters.',
          },
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          msg: 'This phone number is already registered.',
        },
        validate: {
          notEmpty: { msg: 'Phone number is required.' },
          is: {
            args: /^\+?[\d\s\-().]{7,20}$/,
            msg: 'Phone number is not valid.',
          },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          msg: 'This email address is already registered.',
        },
        validate: {
          notEmpty: { msg: 'Email is required.' },
          isEmail: { msg: 'Email address is not valid.' },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password is required.' },
          len: {
            args: [6, 255],
            msg: 'Password must be at least 6 characters.',
          },
        },
      },
      role: {
        type: DataTypes.ENUM('fisher', 'buyer', 'transporter', 'admin'),
        allowNull: false,
        defaultValue: 'buyer',
        validate: {
          isIn: {
            args: [['fisher', 'buyer', 'transporter', 'admin']],
            msg: 'Role must be one of: fisher, buyer, transporter, admin.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  return User;
};