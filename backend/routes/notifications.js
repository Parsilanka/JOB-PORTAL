const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/count/unread', notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all as read
router.patch('/markAll/read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Delete all notifications
router.delete('/deleteAll/notifications', notificationController.deleteAllNotifications);

// Get preferences
router.get('/preferences/settings', notificationController.getPreferences);

// Update preferences
router.patch('/preferences/settings', notificationController.updatePreferences);

module.exports = router;
