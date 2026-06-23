const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// All routes require authentication
router.use(authenticate);

// Send a message
router.post('/', messageController.sendMessage);

// Get conversations
router.get('/conversations', messageController.getConversations);

// Get messages in a conversation
router.get('/:conversationId', messageController.getMessages);

// Mark message as read
router.patch('/:messageId/read', messageController.markMessageAsRead);

// Delete message
router.delete('/:messageId', messageController.deleteMessage);

// Search messages
router.get('/search/query', messageController.searchMessages);

// Get unread count
router.get('/count/unread', messageController.getUnreadCount);

module.exports = router;
