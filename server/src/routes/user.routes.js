import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  sendPhoneOTP,
  verifyPhoneOTP,
  updateGuideProfile,
  uploadIdentityDoc,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadAvatar as avatarUpload, uploadIdentityDocs } from '../middlewares/upload.middleware.js';

const router = Router();

// All routes in this file are protected
router.use(verifyJWT);

router.route('/profile').get(getMyProfile);
router.route('/profile').patch(updateMyProfile); // Use PATCH for partial updates
router.route('/profile/guide').patch(updateGuideProfile); // Complete guide profile update
router.route('/avatar').post(avatarUpload, uploadAvatar); // Upload avatar
router.route('/send-phone-otp').post(sendPhoneOTP); // Send OTP for phone verification
router.route('/verify-phone-otp').post(verifyPhoneOTP); // Verify phone OTP
router.route('/upload-identity/:field').post(uploadIdentityDocs, uploadIdentityDoc); // Upload identity document

export default router;
