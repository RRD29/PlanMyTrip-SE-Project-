import { Router } from 'express';
import express from 'express';
import { stripeWebhookHandler } from '../controllers/payment.controller.js';

const router = Router();


router.route('/webhook').post(
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

export default router;