import dotenv from 'dotenv';
import { createServer } from 'http'; 
import { Server as SocketIOServer } from 'socket.io'; 
import connectDB from './config/db.js';
import { app } from './app.js';
import config from './config/index.js';
import { initSocketListeners } from './services/chat.service.js'; 


dotenv.config({
  path: './.env',
});


const httpServer = createServer(app);


const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.CLIENT_URL, 
    methods: ["GET", "POST"],
  },
});


initSocketListeners(io);


connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("EXPRESS_APP_ERROR: ", error);
      throw error;
    });

    
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