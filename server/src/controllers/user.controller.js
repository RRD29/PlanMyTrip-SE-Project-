import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Get Current User's Profile ---
export const getMyProfile = asyncHandler(async (req, res) => {
    // req.user is attached by the verifyJWT middleware
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});

// --- Update Current User's Profile (FIXED LOGIC) ---
export const updateMyProfile = asyncHandler(async (req, res) => {
    // The client sends these fields, which might be undefined for a regular user
    const { fullName, bio, location, pricePerDay } = req.body;
    
    // 1. Start with non-role-specific updates
    const updateData = {};
    if (fullName) updateData.fullName = fullName;

    // 2. Handle guide-specific updates if the user's role is 'guide'
    if (req.user.role === 'guide') {
        const guideUpdates = {};
        
        // Only set fields that were actually provided to prevent overwriting
        if (bio !== undefined) guideUpdates.bio = bio;
        if (location !== undefined) guideUpdates.location = location;
        // Ensure price is treated as a number
        if (pricePerDay !== undefined) guideUpdates.pricePerDay = Number(pricePerDay);
        
        // Merge guide updates into the main update object
        if (Object.keys(guideUpdates).length > 0) {
            updateData['guideProfile'] = guideUpdates;
        }
    }
    
    // If nothing was sent, throw an error
    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No data provided for update.");
    }

    // 3. Find and update the user document
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        // IMPORTANT: { new: true } returns the updated document
        // { runValidators: true } ensures Mongoose runs schema validation
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found after update attempt.");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});