import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});


export const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});


export const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;

    
    delete updateData.password;
    delete updateData.refreshToken;

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User updated successfully")
    );
});


export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});
