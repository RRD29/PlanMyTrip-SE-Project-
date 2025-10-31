import { Router } from 'express';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import guideRouter from './guide.routes.js';
import bookingRouter from './booking.routes.js';
import paymentRouter from './payment.routes.js';
import itineraryRouter from './itinerary.routes.js';
import adminRouter from './admin.routes.js';

const router = Router();

// Define all API routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/guides', guideRouter);
router.use('/bookings', bookingRouter);
router.use('/payment', paymentRouter);
router.use('/itinerary', itineraryRouter);
router.use('/admin', adminRouter);

export default router;
