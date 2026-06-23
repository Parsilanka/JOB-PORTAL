import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newChatReceiverId, setNewChatReceiverId] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [error, setError] = useState('');
  const [startingChat, setStartingChat] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/users/employers/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data.data);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post('/api/messages', {
        receiverId: getReceiverIdFromConversation(selectedConversation),
        content: newMessage,
        subject: 'Message'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNewMessage('');
      fetchMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startConversation = async (e) => {
    e.preventDefault();
    if (!newChatReceiverId || !newChatMessage.trim()) {
      setError('Please choose a contact and type a message.');
      return;
    }

    try {
      setStartingChat(true);
      setError('');
      await axios.post('/api/messages', {
        receiverId: newChatReceiverId,
        content: newChatMessage,
        subject: 'Message'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewChatReceiverId('');
      setNewChatMessage('');
      await fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Unable to start a conversation right now.');
    } finally {
      setStartingChat(false);
    }
  };

  const getReceiverIdFromConversation = (conversationId) => {
    const conversation = conversations.find(c => c.conversationId === conversationId);
    return conversation?.otherUser?._id;
  };

  const currentUserId = currentUser?._id || localStorage.getItem('userId');

  const searchMessages = async () => {
    if (!searchQuery.trim()) {
      fetchConversations();
      return;
    }

    try {
      const response = await axios.get(`/api/messages/search/query?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Conversations List */}
      <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Messages</h2>
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={searchMessages}
          />
          <form onSubmit={startConversation} className="mt-3 space-y-2">
            <select
              value={newChatReceiverId}
              onChange={(e) => setNewChatReceiverId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Start a new conversation</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>{user.fullName || user.companyName}</option>
              ))}
            </select>
            <textarea
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              rows="2"
              placeholder="Write your first message"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={startingChat} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
              {startingChat ? 'Starting chat...' : 'Start chat'}
            </button>
          </form>
        </div>

        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <div
              key={conversation.conversationId}
              onClick={() => fetchMessages(conversation.conversationId)}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                selectedConversation === conversation.conversationId ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {conversation.otherUser?.fullName}
                </h3>
                {conversation.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {conversation.lastMessage?.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="w-2/3 bg-white dark:bg-gray-800 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-4 flex ${
                    msg.sender?._id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender?._id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <small className="text-xs opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
