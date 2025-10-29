import React, { useState, useEffect, useRef } from 'react';
// import api from '../../services/api'; // Your Axios instance
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon } from '../../assets/icons'; // Using the User icon as a placeholder

// --- A. Mock API ---
// This is a temporary mock of your API and auth
// Remove this and uncomment the real imports above
const FAKE_DELAY = 500;
const useAuth = () => ({ user: { _id: 'user_123', fullName: 'Current User' } });
const api = {
  get: (url) => new Promise(resolve => setTimeout(() => resolve({
    data: [
      { _id: 'msg_1', text: 'Hey! Are you available for the 10th?', sender: { _id: 'user_123', fullName: 'Current User' } },
      { _id: 'msg_2', text: 'Hi! Yes, I am. What time were you thinking?', sender: { _id: 'guide_456', fullName: 'Local Guide' } },
      { _id: 'msg_3', text: 'Great! How about 10 AM at the city center?', sender: { _id: 'user_123', fullName: 'Current User' } },
    ]
  }), FAKE_DELAY)),
  post: (url, data) => new Promise(resolve => setTimeout(() => resolve({
    data: { _id: `msg_${Math.random()}`, ...data, sender: { _id: 'user_123', fullName: 'Current User' } }
  }), FAKE_DELAY)),
};
// --- End Mock API ---


// --- B. Helper Components ---

// Send Button Icon
const SendIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

// Loading Spinner
const ChatSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Message Bubble
const Message = ({ message, isMe }) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end max-w-xs md:max-w-md ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-2">
          <UserIcon className="w-5 h-5 text-gray-500" />
        </div>
        {/* Bubble */}
        <div className={`p-3 rounded-lg ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

// --- C. Main Chat Component ---

/**
 * A Chat Window component
 * @param {{ bookingId: string, guideName: string }} props
 */
function ChatWindow({ bookingId, guideName = "Guide" }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch initial messages
  useEffect(() => {
    if (!bookingId) return;
    
    setLoading(true);
    api.get(`/api/v1/chat/${bookingId}`)
      .then(response => {
        setMessages(response.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
      
    // TODO: In a real app, you would initialize your WebSocket connection here.
    // e.g., socket.emit('joinRoom', bookingId);

  }, [bookingId]);
  
  // 2. Listen for new messages (simulated with Socket.io)
  useEffect(() => {
    // TODO: This is where you'd listen for incoming messages
    // const handleReceiveMessage = (message) => {
    //   if (message.bookingId === bookingId) {
    //     setMessages(prevMessages => [...prevMessages, message]);
    //   }
    // };
    //
    // socket.on('receiveMessage', handleReceiveMessage);
    //
    // return () => {
    //   socket.off('receiveMessage', handleReceiveMessage);
    // };
    
  }, [bookingId]);

  // 3. Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      text: newMessage,
      sender: user, // Use the currently logged-in user
    };

    setSending(true);
    setNewMessage('');
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const response = await api.post(`/api/v1/chat/${bookingId}`, {
        text: newMessage,
      });

      // Replace optimistic message with real one from server
      setMessages(prev => prev.map(msg => 
        msg._id === optimisticMessage._id ? response.data : msg
      ));
      
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      // Optionally, restore the text to the input
      // setNewMessage(optimisticMessage.text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl border border-gray-200">
      
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-center text-gray-800">
          Chat with {guideName}
        </h3>
      </div>
      
      {/* Message List */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {loading ? (
          <ChatSpinner />
        ) : (
          messages.map(msg => (
            <Message
              key={msg._id}
              message={msg}
              isMe={msg.sender._id === user._id}
            />
          ))
        )}
        {/* This empty div is the target for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex space-x-3 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            disabled={!newMessage.trim() || sending}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;