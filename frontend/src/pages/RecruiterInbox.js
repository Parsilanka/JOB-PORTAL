import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiSend, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const RecruiterInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error loading inbox', error);
    }
  };

  const openConversation = async (conversationId, otherUserId) => {
    try {
      const response = await axios.get(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data.data || []);
      setSelectedConversation({ conversationId, otherUserId });
    } catch (error) {
      console.error('Error opening conversation', error);
    }
  };

  const sendMessage = async () => {
    if (!draft.trim() || !selectedConversation) return;
    try {
      await axios.post('/api/messages', {
        receiverId: selectedConversation.otherUserId,
        subject: 'Recruiter follow-up',
        content: draft,
        relatedApplication: null,
        relatedJob: null
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDraft('');
      openConversation(selectedConversation.conversationId, selectedConversation.otherUserId);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const name = conversation.otherUser?.fullName || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Inbox</h1>
          <p className="text-gray-600 mt-2">Communicate with candidates and applicants in a streamlined inbox.</p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3 text-blue-600"><FiMessageSquare /> <span className="font-semibold">Conversations</span></div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg" placeholder="Search contacts" />
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button key={conversation.conversationId} onClick={() => openConversation(conversation.conversationId, conversation.otherUser?._id)} className={`w-full text-left px-4 py-3 border-b hover:bg-blue-50 ${selectedConversation?.conversationId === conversation.conversationId ? 'bg-blue-50' : ''}`}>
                  <div className="font-semibold text-gray-900">{conversation.otherUser?.fullName || 'Contact'}</div>
                  <div className="text-sm text-gray-500 truncate">{conversation.lastMessage?.content || 'Start a conversation'}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[620px]">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">{conversations.find((c) => c.conversationId === selectedConversation.conversationId)?.otherUser?.fullName || 'Conversation'}</div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message._id} className={`flex ${message.sender?._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${message.sender?._id === currentUser?._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-[11px] mt-1 opacity-70">{new Date(message.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 flex gap-2">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" placeholder="Type your message..." />
                  <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><FiSend /> Send</button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation to continue.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterInbox;
