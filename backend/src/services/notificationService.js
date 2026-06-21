/**
 * Aqualink - Notification Service
 *
 * Business logic for notification CRUD and automatic notification creation
 * for important events across Orders, Payments, Deliveries, and Inventory.
 */

const { models } = require('../models');
const { Op } = require('sequelize');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { extractPagination, buildOrder, buildPaginationMeta } = require('../utils/pagination');

/**
 * Create a new notification for a user.
 * @param {string} userId - UUID of the target user
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} type - Notification type (order|payment|delivery|inventory|system)
 * @returns {Object} The created notification
 */
const createNotification = async (userId, title, message, type) => {
  if (!userId || !title || !message || !type) {
    throw new ValidationError('userId, title, message, and type are required.');
  }

  const validTypes = ['order', 'payment', 'delivery', 'inventory', 'system'];
  if (!validTypes.includes(type)) {
    throw new ValidationError(
      `Type must be one of: ${validTypes.join(', ')}.`
    );
  }

  // Verify the user exists
  const user = await models.User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const notification = await models.Notification.create({
    userId,
    title,
    message,
    type,
    isRead: false,
  });

  return notification;
};

/**
 * Get notifications scoped to the authenticated user's permissions, with pagination and sorting.
 * Buyers see their own notifications. Fishers see their own. Transporters see their own. Admins see all.
 * @param {Object} user - Authenticated user { id, role }
 * @param {Object} [pagination] - { page, limit, sortBy, order }
 * @returns {Object} { notifications, unreadCount, pagination }
 */
const getNotifications = async (user, pagination = {}) => {
  const where = {};

  // Non-admin users only see their own notifications
  if (user.role !== 'admin') {
    where.userId = user.id;
  }

  // Unread count is always computed across ALL notifications (not just the page)
  const unreadCount = await models.Notification.count({
    where: { ...where, isRead: false },
  });

  const { page, limit, offset, sortBy, order } = extractPagination(pagination, {
    defaultSortBy: 'createdAt',
    defaultOrder: 'DESC',
  });

  const { count: total, rows: notifications } = await models.Notification.findAndCountAll({
    where,
    order: buildOrder(sortBy, order),
    offset,
    limit,
  });

  return { notifications, unreadCount, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * Get a single notification by ID.
 * Only the notification owner or admin can access it.
 * @param {string} id - Notification UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Notification
 */
const getNotificationById = async (id, user) => {
  const notification = await models.Notification.findByPk(id);

  if (!notification) {
    throw new NotFoundError('Notification not found.');
  }

  // Only owner or admin may access
  if (notification.userId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have access to this notification.');
  }

  return notification;
};

/**
 * Mark a single notification as read.
 * Only the notification owner or admin can perform this action.
 * @param {string} id - Notification UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated notification
 */
const markAsRead = async (id, user) => {
  const notification = await models.Notification.findByPk(id);

  if (!notification) {
    throw new NotFoundError('Notification not found.');
  }

  // Only owner or admin may update
  if (notification.userId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to update this notification.');
  }

  await notification.update({ isRead: true });

  // Return updated notification
  return await models.Notification.findByPk(id);
};

/**
 * Mark all notifications as read for the authenticated user.
 * Admin may mark all notifications as read.
 * @param {Object} user - Authenticated user { id, role }
 * @returns {number} Number of notifications updated
 */
const markAllAsRead = async (user) => {
  const where = {};

  // Non-admin users only mark their own
  if (user.role !== 'admin') {
    where.userId = user.id;
  }

  const [updatedCount] = await models.Notification.update(
    { isRead: true },
    { where: { ...where, isRead: false } }
  );

  return updatedCount;
};

/**
 * Delete a notification.
 * Only the notification owner or admin can delete.
 * @param {string} id - Notification UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {boolean} True if deletion succeeded
 */
const deleteNotification = async (id, user) => {
  const notification = await models.Notification.findByPk(id);

  if (!notification) {
    throw new NotFoundError('Notification not found.');
  }

  // Only owner or admin may delete
  if (notification.userId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to delete this notification.');
  }

  await notification.destroy();

  return true;
};

/**
 * Get unread notification count for the authenticated user.
 * Admin gets total unread count across all users.
 * @param {Object} user - Authenticated user { id, role }
 * @returns {number} Unread count
 */
const getUnreadCount = async (user) => {
  const where = {};

  if (user.role !== 'admin') {
    where.userId = user.id;
  }

  return await models.Notification.count({
    where: { ...where, isRead: false },
  });
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};