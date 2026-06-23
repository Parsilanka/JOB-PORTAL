import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/count/unread', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                    !notif.isRead ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                  onClick={() => markAsRead(notif._id)}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {notif.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notif.description}
                  </p>
                  <small className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                    {new Date(notif.createdAt).toLocaleTimeString()}
                  </small>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <a
              href="/notifications"
              className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
            >
              View All Notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
