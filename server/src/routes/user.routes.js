import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes in this file are protected
router.use(verifyJWT);

router.route('/profile').get(getMyProfile);
router.route('/profile').patch(updateMyProfile); // Use PATCH for partial updates

export default router;