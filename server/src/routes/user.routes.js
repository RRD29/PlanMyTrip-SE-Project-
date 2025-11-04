import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  sendPhoneOTP,
  verifyPhoneOTP,
  // We no longer need these separate controllers:
  // uploadAvatar,
  // updateGuideProfile,
  // uploadIdentityDoc,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
// We will use the 'uploadIdentityDocs' middleware as it seems to handle multiple fields
import { uploadIdentityDocs } from '../middlewares/upload.middleware.js';

const router = Router();

// All routes in this file are protected
router.use(verifyJWT);

// --- Get Profile (No Change) ---
router.route('/profile').get(getMyProfile);

// --- UPDATE PROFILE (CONSOLIDATED) ---
// This single route now handles all profile updates:
// 1. It uses 'uploadIdentityDocs' to process all files (avatar, ID proofs, etc.)
// 2. It sends all text fields (req.body) AND file info (req.files) 
//    to the SINGLE 'updateMyProfile' controller.
router.route('/profile').patch(uploadIdentityDocs, updateMyProfile);

// --- REMOVED SEPARATE UPDATE ROUTES ---
// These are no longer needed as they are handled by the route above.
// router.route('/profile/guide').patch(updateGuideProfile);
// router.route('/avatar').post(avatarUpload, uploadAvatar);
// router.route('/upload-identity/:field').post(uploadIdentityDocs, uploadIdentityDoc);

// --- Phone Verification (No Change) ---
router.route('/send-phone-otp').post(sendPhoneOTP);
router.route('/verify-phone-otp').post(verifyPhoneOTP);

export default router;