import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Get All Guides (Public Marketplace) ---
export const getAllGuides = asyncHandler(async (req, res) => {
    const { location, search, minPrice, maxPrice, minRating, minExperience } = req.query;

    const query = {
        role: 'guide',
    };

    // Add location and search filters to the query if they exist
    const searchConditions = [];

    if (location) {
        // Search by guideProfile location
        searchConditions.push({ 'guideProfile.baseLocation': { $regex: location, $options: 'i' } });
    }

    if (search) {
        // Search by name OR bio
        searchConditions.push(
            { fullName: { $regex: search, $options: 'i' } },
            { 'guideProfile.bio': { $regex: search, $options: 'i' } }
        );
    }

    // If we have search criteria, add them to the main query
    if (searchConditions.length > 0) {
        query['$or'] = searchConditions;
    }

    // Add filter conditions
    if (minPrice || maxPrice) {
        query['guideProfile.pricePerDay'] = {};
        if (minPrice) query['guideProfile.pricePerDay'].$gte = parseFloat(minPrice);
        if (maxPrice) query['guideProfile.pricePerDay'].$lte = parseFloat(maxPrice);
    }

    if (minRating) {
        query['guideProfile.rating'] = { $gte: parseFloat(minRating) };
    }

    if (minExperience) {
        query['guideProfile.yearsExperience'] = { $gte: parseInt(minExperience) };
    }

    // Fetch guides and ensure we select all necessary fields
    const guides = await User.find(query).select("fullName avatar guideProfile createdAt");

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

    return res.status(200).json(
        new ApiResponse(200, guide, "Guide profile fetched successfully")
    );
});
