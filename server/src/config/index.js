import dotenv from 'dotenv';


dotenv.config();

const config = {
  PORT: process.env.PORT || 8000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
  
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  
  
  CLIENT_URL: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000', 
};

export default config;