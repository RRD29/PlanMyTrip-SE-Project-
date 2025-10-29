import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword, // Import new controller
  resetPassword,  // Import new controller
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Public Routes ---
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword); // Add forgot password route
router.route('/reset-password/:token').patch(resetPassword); // Add reset password route (PATCH is suitable)

// --- Secured Route ---
router.route('/logout').post(verifyJWT, logoutUser);

export default router;