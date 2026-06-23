import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiMessageCircle, FiSend, FiX, FiCpu } from 'react-icons/fi';

const QUICK_QUESTIONS = [
  'How do I apply for a job?',
  'How do I post a job?',
  'How do I check my messages?',
  'How does payment work?'
];

const getReply = (input) => {
  const text = input.toLowerCase();

  if (text.includes('apply') || text.includes('job')) {
    return 'You can browse jobs and use the Apply button on any listing. If you need help, open the Jobs page and choose a role that matches your profile.';
  }

  if (text.includes('post')) {
    return 'Employers can post a vacancy from the Post Job section and then manage applications from My Jobs.';
  }

  if (text.includes('message') || text.includes('chat')) {
    return 'Open the Messages page to view conversations and continue chatting with candidates or recruiters.';
  }

  if (text.includes('payment') || text.includes('mpesa') || text.includes('pay')) {
    return 'Payments are handled through the platform checkout flow. If you are stuck, check the payment page or contact support for help.';
  }

  if (text.includes('profile') || text.includes('account')) {
    return 'You can update your personal details and view your achievements from the Profile page.';
  }

  return 'I can help with applying for jobs, posting jobs, checking messages, payments, and profile updates. Ask me anything related to the platform.';
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am JobPortal Assistant. I can help with applications, postings, messages, and payments.'
    }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: getReply(trimmed)
        }
      ]);
    }, 350);
  };

  const quickActions = useMemo(() => QUICK_QUESTIONS, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-[340px] max-w-[92vw] rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <FiCpu />
              <div>
                <div className="font-semibold">JobPortal Assistant</div>
                <div className="text-xs text-blue-100">Online now</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-blue-500">
              <FiX />
            </button>
          </div>

          <div className="h-72 overflow-y-auto bg-gray-50 p-3">
            {messages.map((message) => (
              <div key={message.id} className={`mb-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickActions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100"
                >
                  {question}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Ask me anything..."
              />
              <button onClick={() => sendMessage()} className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700">
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg hover:bg-blue-700"
        >
          <FiMessageCircle />
          <span className="font-medium">Chatbot</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
