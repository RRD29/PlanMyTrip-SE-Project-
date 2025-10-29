import { Router } from 'express';
import { generateItinerary } from '../controllers/itinerary.controller.js';
import { verifyJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Only logged-in users can generate an itinerary
router
  .route('/generate')
  .post(verifyJWT, authorizeRole('user'), generateItinerary);

export default router;