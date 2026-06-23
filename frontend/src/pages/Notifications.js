import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', {
        params: { unreadOnly: filter === 'unread' },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/api/notifications/count/unread', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/markAll/read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      job_match: '💼',
      application_update: '📋',
      message: '💬',
      interview_scheduled: '📅',
      job_posted: '📌',
      payment_received: '💰',
      subscription_expiring: '⏰',
      new_review: '⭐',
      job_recommendation: '🎯'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700'
            }`}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition ${
                  notification.isRead
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {notification.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                      )}
                      <small className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
