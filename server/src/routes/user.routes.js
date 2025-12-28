import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  sendPhoneOTP,
  verifyPhoneOTP,
  
  
  
  
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import { uploadIdentityDocs } from '../middlewares/upload.middleware.js';

const router = Router();


router.use(verifyJWT);


router.route('/profile').get(getMyProfile);






router.route('/profile').patch(uploadIdentityDocs, updateMyProfile);








router.route('/send-phone-otp').post(sendPhoneOTP);
router.route('/verify-phone-otp').post(verifyPhoneOTP);

export default router;