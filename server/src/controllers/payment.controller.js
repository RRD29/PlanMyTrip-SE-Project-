import { stripe } from '../config/stripe.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { handlePaymentIntentSucceeded } from '../services/payment.service.js'; 


export const stripeWebhookHandler = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
            
            
            
            await handlePaymentIntentSucceeded(paymentIntent);
            
            break;
            
        case 'payment_intent.payment_failed':
            const paymentIntentFailed = event.data.object;
            console.log(`PaymentIntent failed: ${paymentIntentFailed.id}`);
            
            break;
            
        
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    
    res.json({ received: true });
});