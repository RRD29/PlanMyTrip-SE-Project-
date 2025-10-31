import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.MONGODB_URI || 'mongodb://localhost:27017/trip-planner');
    console.log(`\n✅ MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection FAILED: ", error);
    process.exit(1); // Exit the application with an error
  }
};

export default connectDB;
