import { Router } from 'express';
import {
  createBooking,
  verifyOtp,
  getMyBookings,
} from '../controllers/booking.controller.js';
import { verifyJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();


router.use(verifyJWT);

router.route('/create').post(authorizeRole('user'), createBooking);
router.route('/my-bookings').get(getMyBookings); 
router
  .route('/verify-otp/:bookingId')
  .post(authorizeRole('user', 'guide'), verifyOtp);

export default router;