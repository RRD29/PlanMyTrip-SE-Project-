import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';
import config from './config/index.js';

// --- 1. Configure environment variables ---
// This loads the .env file at the root of the /server directory
dotenv.config({
  path: './.env',
});

// --- 2. Connect to Database and Start Server ---
connectDB()
  .then(() => {
    // Handle any errors that occur in the Express app itself
    app.on("error", (error) => {
      console.error("EXPRESS_APP_ERROR: ", error);
      throw error;
    });

    // Start listening for requests
    app.listen(config.PORT || 8000, () => {
      console.log(`\n✅ Server is running on port: ${config.PORT || 8000}`);
      console.log(`Client URL: ${config.CLIENT_URL}`);
    });
  })
  .catch((err) => {
    // Handle fatal database connection error
    console.error("MONGO_DB_CONNECTION_FAILED !!! ", err);
    process.exit(1);
  });   