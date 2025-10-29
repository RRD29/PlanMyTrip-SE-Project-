import { Booking } from '../models/booking.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { 
    createBookingService, 
    verifyOtpService 
} from '../services/booking.service.js'; // We will create this

// --- 1. Create a New Booking (and Payment Intent) ---
export const createBooking = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { guideId, startDate, endDate, totalAmount, tripDetails } = req.body;

    if (!guideId || !startDate || !endDate || !totalAmount) {
        throw new ApiError(400, "Missing required booking details");
    }

    // We delegate all the complex logic to a service
    const { booking, clientSecret } = await createBookingService(userId, {
        guideId,
        startDate,
        endDate,
        totalAmount,
        tripDetails,
    });

    return res.status(201).json(
        new ApiResponse(
            201, 
            { booking, clientSecret }, 
            "Booking initiated. Please complete payment."
        )
    );
});

// --- 2. Verify OTP (The Core Escrow Logic) ---
export const verifyOtp = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const user = req.user; // User object (user or guide) from verifyJWT

    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    // Delegate the complex verification and payment release to a service
    const updatedBooking = await verifyOtpService(user, bookingId, otp);

    return res.status(200).json(
        new ApiResponse(200, updatedBooking, "OTP verification successful")
    );
});

// --- 3. Get Bookings for the Logged-in User (User or Guide) ---
export const getMyBookings = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'user') {
        query = { user: userId };
    } else if (userRole === 'guide') {
        query = { guide: userId };
    }

    const bookings = await Booking.find(query)
                                  .populate(userRole === 'user' ? 'guide' : 'user', 'fullName avatar')
                                  .sort({ startDate: -1 });

    return res.status(200).json(
        new ApiResponse(200, bookings, "Bookings fetched successfully")
    );
});