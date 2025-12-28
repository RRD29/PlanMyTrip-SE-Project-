import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword, 
  resetPassword,  
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword); 
router.route('/reset-password/:token').patch(resetPassword); 


router.route('/logout').post(verifyJWT, logoutUser);

export default router;