import { ChatMessage } from '../models/chatMessage.model.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

let ioInstance;

/**
 * Saves a message to the database.
 */
const saveMessage = async (data) => {
  try {
    const chatMessage = await ChatMessage.create({
      booking: data.bookingId,
      sender: data.senderId,
      text: data.text,
    });
    // Populate sender info for the frontend
    await chatMessage.populate('sender', 'fullName avatar'); 
    return chatMessage;
  } catch (error) {
    console.error("Failed to save chat message:", error);
    return null;
  }
};

/**
 * Authenticates a socket connection using the JWT from the handshake query.
 * This ensures only authenticated users can connect to the chat server.
 */
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication failed: No token provided."));
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    socket.user = decodedToken; // Attach user info to the socket
    next();
  } catch (err) {
    return next(new Error("Authentication failed: Invalid token."));
  }
};

/**
 * Initializes all Socket.io event listeners.
 * @param {SocketIOServer} io - The Socket.io server instance.
 */
export const initSocketListeners = (io) => {
  ioInstance = io;
  
  // Apply authentication middleware to all incoming connections
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.user; // User object from middleware

    console.log(`[SOCKET] User connected: ${user.fullName} (${user._id})`);

    // --- 1. JOIN ROOM (Booking) ---
    socket.on('joinRoom', async (bookingId) => {
      // The room name is the booking ID
      socket.join(bookingId);
      console.log(`[SOCKET] ${user.fullName} joined room: ${bookingId}`);

      // Optional: Fetch and send history (we will implement this in the REST endpoint)
    });

    // --- 2. SEND MESSAGE ---
    socket.on('sendMessage', async (data) => {
      // data: { bookingId: string, text: string }
      
      const messageData = {
        bookingId: data.bookingId,
        senderId: user._id,
        text: data.text,
      };
      
      // Save message to DB
      const savedMessage = await saveMessage(messageData);

      if (savedMessage) {
        // Emit the message to all users currently in that room (booking)
        io.to(data.bookingId).emit('receiveMessage', savedMessage);
      }
    });

    // --- 3. DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User disconnected: ${user.fullName}`);
    });
  });
};


/**
 * REST Endpoint for fetching chat history (used on load).
 */
export const fetchChatHistory = async (bookingId) => {
  // Fetch the last 50 messages, ordered by newest first
  const messages = await ChatMessage.find({ booking: bookingId })
    .populate('sender', 'fullName avatar') // Get sender details
    .sort({ createdAt: 1 })
    .limit(50);
  
  return messages;
};