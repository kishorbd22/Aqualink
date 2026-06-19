/**
 * Aqualink - Notification Routes
 *
 * Route definitions for notification CRUD and management endpoints.
 * All mounted under /api/notifications.
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/notifications — Create a notification (admin only)
router.post('/', authenticate, authorize('admin'), notificationController.createNotification);

// GET /api/notifications/unread-count — Get unread count (authenticated users)
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// GET /api/notifications — Get all notifications (authenticated users, scoped by role)
router.get('/', authenticate, notificationController.getNotifications);

// GET /api/notifications/:id — Get a single notification (authenticated users, access controlled)
router.get('/:id', authenticate, notificationController.getNotificationById);

// PATCH /api/notifications/read-all — Mark all notifications as read (authenticated users)
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read — Mark a notification as read (authenticated users, access controlled)
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// DELETE /api/notifications/:id — Delete a notification (authenticated users, access controlled)
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;