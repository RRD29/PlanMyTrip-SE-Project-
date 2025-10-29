import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import stripePromise from '../../lib/stripe'; // Your Stripe.js loader
import { useBooking } from '../../contexts/BookingContext'; // Your booking context
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';
import { useNavigate } from 'react-router-dom';

// --- This is the actual payment form ---
// We keep it in the same file to contain the logic
const StripePaymentForm = ({ bookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    // This is where Stripe confirms the payment with the clientSecret
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // We'll redirect to a "booking success" page,
        // but for now, we'll redirect to the OTP page.
        return_url: `${window.location.origin}/booking/${bookingId}/verify`,
      },
      // We set redirect to 'if_required' to handle success/error here
      redirect: 'if_required', 
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded!
      // The backend webhook will handle the "Paid/Escrowed" status update.
      // We can now send the user to the OTP page.
      setMessage('Payment successful! Redirecting...');
      navigate(`/booking/${bookingId}/verify`);
    } else {
      setMessage('An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" />
      <Button
        type="submit"
        loading={isProcessing}
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
      
      {/* Show any error or success messages */}
      {message && <div id="payment-message" className="text-red-500 text-center font-medium">{message}</div>}
    </form>
  );
};


// --- This is the main Page component ---
const BookingPage = () => {
  // In a real app, you'd get the booking details (ID, amount)
  // from a URL param or context after the user creates the trip plan.
  
  // --- MOCK DATA (Remove in real app) ---
  const MOCK_BOOKING = {
    _id: 'booking_12345',
    guide: 'Guide Name',
    destination: 'Paris, France',
    totalAmount: 250,
  };
  // --- END MOCK DATA ---

  const { createBooking, loading: bookingLoading } = useBooking();
  const [clientSecret, setClientSecret] = useState('');
  const [bookingDetails, setBookingDetails] = useState(MOCK_BOOKING);
  const [error, setError] = useState('');

  // Step 1: Create the booking & payment intent on the backend
  useEffect(() => {
    // This function runs once when the page loads
    const getPaymentIntent = async () => {
      try {
        // This data would come from the previous trip planner step
        const bookingData = {
          guideId: 'guide_abc',
          destination: MOCK_BOOKING.destination,
          totalAmount: MOCK_BOOKING.totalAmount,
          // ...other details
        };

        // Call the context function
        const response = await createBooking(bookingData); 
        
        // The backend returns the clientSecret and the full booking object
        setClientSecret(response.clientSecret);
        setBookingDetails(response.booking);

      } catch (err) {
        console.error(err);
        setError('Failed to initialize payment. Please try again.');
      }
    };

    // getPaymentIntent(); // Uncomment this when useBooking is fully wired
    setClientSecret('pi_example_secret_123456789'); // FAKE SECRET FOR TESTING

  }, [createBooking]);

  // Stripe appearance options
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0ea5e9', // sky-500
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // --- Render Logic ---
  if (bookingLoading || (!clientSecret && !error)) {
    return <PageLoader text="Initializing secure payment..." />;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-12">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        
        {/* --- Booking Summary --- */}
        <div className="space-y-4 md:pt-8">
          <h2 className="text-2xl font-semibold text-gray-800">Booking Summary</h2>
          <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium">{bookingDetails.destination}</h3>
            <p className="text-gray-600">with {bookingDetails.guide}</p>
            <hr className="my-4" />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total (USD)</span>
              <span className="text-2xl font-bold text-gray-900">
                ${bookingDetails.totalAmount}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Your payment will be held securely by PlanMyTrip and released to the guide
              only after you confirm the meet-up.
            </p>
          </div>
        </div>

        {/* --- Payment Form --- */}
        <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Enter Payment Details
          </h2>
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <StripePaymentForm bookingId={bookingDetails._id} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;