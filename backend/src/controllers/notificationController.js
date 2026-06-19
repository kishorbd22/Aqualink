/**
 * Aqualink - Notification Controller
 *
 * Request handlers for notification CRUD and management endpoints.
 */

const notificationService = require('../services/notificationService');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/notifications
 * Create a new notification. Requires authentication (admin only).
 */
const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message || !type) {
      throw new ValidationError('userId, title, message, and type are required.');
    }

    const notification = await notificationService.createNotification(
      userId,
      title,
      message,
      type
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications
 * Get all notifications scoped to the authenticated user's permissions.
 */
const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.user);

    res.status(200).json({
      success: true,
      count: result.notifications.length,
      unreadCount: result.unreadCount,
      data: { notifications: result.notifications },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/:id
 * Get a single notification by ID.
 */
const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.getNotificationById(id, req.user);

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const updatedCount = await notificationService.markAllAsRead(req.user);

    res.status(200).json({
      success: true,
      message: `Successfully marked ${updatedCount} notification(s) as read.`,
      data: { updatedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification.
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the authenticated user.
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
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