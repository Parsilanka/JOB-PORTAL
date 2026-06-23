const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, content, relatedJob, relatedApplication } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if sender is trying to message themselves
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send messages to yourself' });
    }

    // Create conversation ID (sorted for consistency)
    const conversationId = [senderId, receiverId].sort().join('_');

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      subject,
      content,
      conversationId,
      relatedJob: relatedJob || null,
      relatedApplication: relatedApplication || null
    });

    await message.save();
    await message.populate(['sender', 'receiver']);

    // Create notification for receiver
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: `New message from ${req.user.fullName}`,
      description: subject || content.substring(0, 100),
      data: {
        relatedUser: senderId,
        relatedMessage: message._id
      },
      actionUrl: `/messages/${conversationId}`
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $skip: parseInt(offset)
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const otherUserId = msg.lastMessage.sender.equals(userId)
          ? msg.lastMessage.receiver
          : msg.lastMessage.sender;
        const otherUser = await User.findById(otherUserId).select('fullName profilePicture');
        return {
          conversationId: msg._id,
          otherUser,
          lastMessage: msg.lastMessage,
          unreadCount: msg.unreadCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversations,
      total: conversations.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({ conversationId })
      .populate(['sender', 'receiver'])
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      total: messages.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.receiver.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.sender.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, limit = 20, offset = 0 } = req.query;

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        },
        {
          $or: [
            { content: { $regex: query, $options: 'i' } },
            { subject: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .populate(['sender', 'receiver'])
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: messages,
      total: messages.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
