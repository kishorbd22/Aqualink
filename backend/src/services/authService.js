/**
 * Aqualink - Auth Service
 *
 * Business logic for user registration and login.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const { ValidationError, AuthenticationError } = require('../utils/errors');

const SALT_ROUNDS = 10;

/**
 * Register a new user.
 * @param {Object} userData - { name, phone, email, password, role }
 * @returns {Object} { user, token }
 */
const register = async (userData) => {
  const { name, phone, email, password, role } = userData;

  // Check if email already exists
  const existingEmail = await models.User.findOne({ where: { email } });
  if (existingEmail) {
    throw new ValidationError('A user with this email already exists.');
  }

  // Check if phone already exists
  const existingPhone = await models.User.findOne({ where: { phone } });
  if (existingPhone) {
    throw new ValidationError('A user with this phone number already exists.');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create the user
  const user = await models.User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    role: role || 'buyer',
  });

  // Generate JWT
  const token = generateToken(user);

  // Return user without password
  const userJson = user.toJSON();
  delete userJson.password;

  return { user: userJson, token };
};

/**
 * Login an existing user.
 * @param {Object} credentials - { email, password }
 * @returns {Object} { user, token }
 */
const login = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email, including password field (excluded by default scope)
  const user = await models.User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    throw new AuthenticationError('Invalid email or password.');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password.');
  }

  // Generate JWT
  const token = generateToken(user);

  // Return user without password
  const userJson = user.toJSON();
  delete userJson.password;

  return { user: userJson, token };
};

/**
 * Generate a JWT for the given user.
 * @param {Object} user - Sequelize User instance
 * @returns {String} Signed JWT
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'aqualink-dev-secret-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = { register, login, generateToken };