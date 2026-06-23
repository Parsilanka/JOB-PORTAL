const Notification = require('../models/Notification');

// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('data.relatedUser', 'fullName profilePicture')
      .populate('data.relatedJob', 'title location')
      .populate('data.relatedApplication');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      total,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.user.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.user.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real application, you'd fetch this from the database
    const preferences = {
      jobMatch: true,
      applicationUpdate: true,
      message: true,
      interviewScheduled: true,
      jobPosted: true,
      paymentReceived: true,
      subscriptionExpiring: true,
      newReview: true,
      jobRecommendation: true
    };

    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // In a real application, you'd save this to the database
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({
      user: userId,
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
