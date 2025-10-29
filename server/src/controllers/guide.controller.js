import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Get All Guides (Public) ---
export const getAllGuides = asyncHandler(async (req, res) => {
    // TODO: Add filtering and pagination from req.query
    const { location, search } = req.query;

    const query = { role: 'guide' };
    
    if (location) {
        query['guideProfile.location'] = { $regex: location, $options: 'i' };
    }
    if (search) {
        query['$or'] = [
            { fullName: { $regex: search, $options: 'i' } },
            { 'guideProfile.bio': { $regex: search, $options: 'i' } },
        ];
    }

    const guides = await User.find(query).select("-password -refreshToken -email");

    return res.status(200).json(
        new ApiResponse(200, guides, "Guides fetched successfully")
    );
});

// --- Get Single Guide by ID (Public) ---
export const getGuideById = asyncHandler(async (req, res) => {
    const { guideId } = req.params;
    
    const guide = await User.findOne({ _id: guideId, role: 'guide' })
                            .select("-password -refreshToken -email");
    
    if (!guide) {
        throw new ApiError(404, "Guide not found");
    }

    // We'll fetch reviews separately later
    
    return res.status(200).json(
        new ApiResponse(200, guide, "Guide profile fetched successfully")
    );
});