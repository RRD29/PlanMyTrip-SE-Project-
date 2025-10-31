import { User } from '../models/user.model.js'; // Ensure this import is correct
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';

// --- Utility function to generate tokens ---
const generateAccessAndRefreshTokens = async(userId) => {
    const user = await User.findById(userId); // Fetches a Mongoose document
    if (!user) throw new ApiError(404, "User not found during token generation");

    // Methods should exist on this 'user' document
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const cookieOptions = { /* ... */ };

// --- Register User (CORRECTED) ---
export const registerUser = asyncHandler(async (req, res) => {
    
    // --- THIS IS THE FIX ---
    // 1. Read the data from the request body
    const { email, password, fullName, role } = req.body;

    // 2. Validate the data
    if ([email, password, fullName, role].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // 3. Create the user with the data from the body
    const user = await User.create({
        email,
        password,
        fullName,
        role  // <-- This now correctly passes "user" or "guide"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    // --- END OF FIX ---

    // ... rest of registration including calling generateAccessAndRefreshTokens ...
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json( new ApiResponse( 201, { user: createdUser, accessToken, refreshToken }, "User registered and logged in successfully" ));
});

// --- Login User ---
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // ... validation ...

    // Fetch user - this SHOULD return a Mongoose document
    const user = await User.findOne({ email });
    if (!user) { throw new ApiError(404, "User not found"); }

    // Call the method ON the Mongoose document
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) { throw new ApiError(401, "Invalid credentials"); }

    // Call token generation
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json( new ApiResponse( 200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully" ));
});

// --- Logout User ---
export const logoutUser = asyncHandler(async (req, res) => { /* ... logout logic ... */ });

// --- Forgot Password ---
export const forgotPassword = asyncHandler(async (req, res) => { /* ... forgot password logic ... */ });

// --- Reset Password ---
export const resetPassword = asyncHandler(async (req, res) => { /* ... reset password logic ... */ });