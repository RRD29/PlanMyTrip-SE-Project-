import { ChatMessage } from '../models/chatMessage.model.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

let ioInstance;


const saveMessage = async (data) => {
  try {
    const chatMessage = await ChatMessage.create({
      booking: data.bookingId,
      sender: data.senderId,
      text: data.text,
    });
    
    await chatMessage.populate('sender', 'fullName avatar'); 
    return chatMessage;
  } catch (error) {
    console.error("Failed to save chat message:", error);
    return null;
  }
};


const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication failed: No token provided."));
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    socket.user = decodedToken; 
    next();
  } catch (err) {
    return next(new Error("Authentication failed: Invalid token."));
  }
};


export const initSocketListeners = (io) => {
  ioInstance = io;
  
  
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.user; 

    console.log(`[SOCKET] User connected: ${user.fullName} (${user._id})`);

    
    socket.on('joinRoom', async (bookingId) => {
      
      socket.join(bookingId);
      console.log(`[SOCKET] ${user.fullName} joined room: ${bookingId}`);

      
    });

    
    socket.on('sendMessage', async (data) => {
      
      
      const messageData = {
        bookingId: data.bookingId,
        senderId: user._id,
        text: data.text,
      };
      
      
      const savedMessage = await saveMessage(messageData);

      if (savedMessage) {
        
        io.to(data.bookingId).emit('receiveMessage', savedMessage);
      }
    });

    
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User disconnected: ${user.fullName}`);
    });
  });
};



export const fetchChatHistory = async (bookingId) => {
  
  const messages = await ChatMessage.find({ booking: bookingId })
    .populate('sender', 'fullName avatar') 
    .sort({ createdAt: 1 })
    .limit(50);
  
  return messages;
};