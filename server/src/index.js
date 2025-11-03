import dotenv from 'dotenv';
import { createServer } from 'http'; // Import Node's HTTP module
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.io
import connectDB from './config/db.js';
import { app } from './app.js';
import config from './config/index.js';
import { initSocketListeners } from './services/chat.service.js'; // New service import

// --- 1. Configure environment variables ---
dotenv.config({
  path: './.env',
});

// --- Create the HTTP server using the Express app ---
const httpServer = createServer(app);

// --- Configure Socket.io Server ---
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.CLIENT_URL, // Allow requests only from your frontend URL (e.g., http://localhost:8001)
    methods: ["GET", "POST"],
  },
});

// --- Initialize Socket.io listeners with the 'io' instance ---
initSocketListeners(io);

// --- 2. Connect to Database and Start Server ---
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("EXPRESS_APP_ERROR: ", error);
      throw error;
    });

    // Start listening on the HTTP server (which runs Express and Socket.io)
    httpServer.listen(config.PORT || 8000, '0.0.0.0', () => {
      console.log(`\n✅ Server is running on port: ${config.PORT || 8000}`);
      console.log(`🌐 Accessible at: http://<your_local_ip>:${config.PORT || 8000}`);
      console.log(`Client URL: ${config.CLIENT_URL}`);
      console.log(`📡 Socket.io is active.`);
    });
  })
  .catch((err) => {
    console.error("MONGO_DB_CONNECTION_FAILED !!! ", err);
    process.exit(1);
  }); 