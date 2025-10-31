import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import mainRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// --- Global Middleware ---

// Enable CORS
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));

// We need this middleware *before* the payment.routes.js is hit for the webhook
// But since the route itself defines its own 'express.raw' body parser,
// we can place the standard parsers here.
app.use(express.json({ limit: '16kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files (e.g., uploads)
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Parse cookies
app.use(cookieParser());

// --- API Routes ---
// All API routes are prefixed with /api/v1
app.use('/api/v1', mainRouter);

// --- Global Error Handler ---
// This must be the LAST middleware.
// It will catch all errors from `asyncHandler` and `ApiError`.
app.use(errorHandler);

export { app };
