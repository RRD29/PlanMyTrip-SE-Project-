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

// --- Update Current User's Profile ---
export const updateMyProfile = asyncHandler(async (req, res) => {
    const { fullName, bio, location, pricePerDay, availability } = req.body;
    
    // Create an object with only the fields to be updated
    const updateData = {};
    if (fullName) updateData.fullName = fullName;

    // Guide-specific fields
    if (req.user.role === 'guide') {
        updateData.guideProfile = {
            bio,
            location,
            pricePerDay,
            availability,
        };
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});