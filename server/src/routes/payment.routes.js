import { Router } from 'express';
import express from 'express';
import { stripeWebhookHandler } from '../controllers/payment.controller.js';

const router = Router();

// This route MUST use express.raw to get the raw request body for signature verification
router.route('/webhook').post(
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

export default router;