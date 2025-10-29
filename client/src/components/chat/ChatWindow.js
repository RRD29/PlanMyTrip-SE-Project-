import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/axios'; // Your Axios instance
import { useAuth } from '../../contexts/AuthContext';
import useSocket from '../../hooks/useSocket'; // <-- Import the new hook
import { UserIcon } from '../../assets/icons'; 

// --- Helper Components (Keep these the same) ---

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
  const senderName = message.sender?.fullName.split(' ')[0] || 'Unknown';
  
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end max-w-xs md:max-w-md ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-2">
          <UserIcon className="w-5 h-5 text-gray-500" />
        </div>
        {/* Bubble */}
        <div className={`p-3 rounded-lg ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
          {!isMe && <p className="text-xs font-semibold mb-1">{senderName}</p>}
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Chat Component ---

/**
 * A Chat Window component
 * @param {{ bookingId: string, guideName: string }} props
 */
function ChatWindow({ bookingId, guideName = "Guide" }) {
  const { user } = useAuth();
  const socket = useSocket(); // Get the socket instance
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch initial messages (REST API)
  useEffect(() => {
    if (!bookingId) return;
    
    setLoading(true);
    api.get(`/api/v1/chat/history/${bookingId}`) // New REST endpoint for history
      .then(response => {
        setMessages(response.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  }, [bookingId]);
  
  // 2. Manage Socket connection and listeners
  useEffect(() => {
    if (!socket || !bookingId) return;

    // A. Join the specific chat room (the booking ID)
    socket.emit('joinRoom', bookingId);

    // B. Listener for incoming messages
    const handleReceiveMessage = (message) => {
      // Ensure the sender isn't the current user (if the server echoes)
      // and that the message is for the correct room (security check)
      if (message.booking.toString() === bookingId.toString()) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    
    // Cleanup function
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      // socket.emit('leaveRoom', bookingId); // Optional
    };
  }, [socket, bookingId]);

  // 3. Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Handle sending a new message (SOCKET EVENT)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || sending || !socket) return;

    setSending(true);
    setNewMessage('');
    
    // --- Send message via Socket ---
    socket.emit('sendMessage', { 
      bookingId, 
      text, 
    });
    // The server will save the message and then broadcast it back to all users in the room,
    // including us, where handleReceiveMessage will update the state.
    
    setSending(false);
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
            disabled={sending || !socket}
          />
          <button
            type="submit"
            className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            disabled={!newMessage.trim() || sending || !socket}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
        {!socket && <p className="text-center text-xs text-red-500 mt-2">Connecting to chat...</p>}
      </div>
    </div>
  );
}

export default ChatWindow;