import { stripe } from '../config/stripe.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { handlePaymentIntentSucceeded } from '../services/payment.service.js'; // We will create this

// --- Stripe Webhook Handler ---
export const stripeWebhookHandler = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // req.body is the raw body, thanks to our middleware in index.js
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
            
            // Delegate logic to a service
            // This service will find the booking, update status, and send OTPs
            await handlePaymentIntentSucceeded(paymentIntent);
            
            break;
            
        case 'payment_intent.payment_failed':
            const paymentIntentFailed = event.data.object;
            console.log(`PaymentIntent failed: ${paymentIntentFailed.id}`);
            // TODO: Notify the user that payment failed
            break;
            
        // ... handle other event types as needed
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});