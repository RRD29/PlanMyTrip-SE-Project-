import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import stripePromise from '../../lib/stripe'; 
import { useBooking } from '../../contexts/BookingContext'; 
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';
import { useNavigate } from 'react-router-dom';



const StripePaymentForm = ({ bookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      
      return;
    }

    setIsProcessing(true);

    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        
        
        return_url: `${window.location.origin}/booking/${bookingId}/verify`,
      },
      
      redirect: 'if_required', 
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      
      
      
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
      
      {}
      {message && <div id="payment-message" className="text-red-500 text-center font-medium">{message}</div>}
    </form>
  );
};



const BookingPage = () => {
  
  
  
  
  const MOCK_BOOKING = {
    _id: 'booking_12345',
    guide: 'Guide Name',
    destination: 'Paris, France',
    totalAmount: 250,
  };
  

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
          
        };

        
        const response = await createBooking(bookingData); 
        
        
        setClientSecret(response.clientSecret);
        setBookingDetails(response.booking);

      } catch (err) {
        console.error(err);
        setError('Failed to initialize payment. Please try again.');
      }
    };

    
    setClientSecret('pi_example_secret_123456789'); 

  }, [createBooking]);

  
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0ea5e9', 
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  
  if (bookingLoading || (!clientSecret && !error)) {
    return <PageLoader text="Initializing secure payment..." />;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-12">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        
        {}
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

        {}
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