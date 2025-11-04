import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Get All Guides (Public Marketplace) ---
export const getAllGuides = asyncHandler(async (req, res) => {
    // 1. Destructure all possible filters
    const { location, search, minPrice, maxPrice, minRating, minExperience, destination } = req.query;

    // 2. Build the main query using $and to combine all filters
    const filters = [{ role: 'guide' }];

    // 3. Build text-based search conditions ($or)
    const textSearchConditions = [];
    if (search) {
        textSearchConditions.push(
            { fullName: { $regex: search, $options: 'i' } },
            { 'guideProfile.bio': { $regex: search, $options: 'i' } }
        );
    }
    if (location) {
        // Your code uses 'location' to search expertiseRegions. We'll keep that.
        textSearchConditions.push({ 'guideProfile.expertiseRegions': { $regex: location, $options: 'i' } });
    }
    if (destination) {
        // 'destination' also searches expertiseRegions
        textSearchConditions.push({ 'guideProfile.expertiseRegions': { $regex: destination, $options: 'i' } });
    }
    
    // Add the $or block to the main $and filter if any text search exists
    if (textSearchConditions.length > 0) {
        filters.push({ $or: textSearchConditions });
    }

    // 4. Build numeric/range filters
    if (minPrice || maxPrice) {
        const priceQuery = {};
        if (minPrice) priceQuery.$gte = parseFloat(minPrice);
        if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
        filters.push({ 'guideProfile.pricePerDay': priceQuery });
    }
    if (minRating) {
        filters.push({ 'guideProfile.rating': { $gte: parseFloat(minRating) } });
    }
    if (minExperience) {
        filters.push({ 'guideProfile.yearsExperience': { $gte: parseInt(minExperience) } });
    }

    // 5. Create the final query
    // If only { role: 'guide' } is present, just use that. Otherwise, combine all with $and.
    const finalQuery = filters.length > 1 ? { $and: filters } : { role: 'guide' };

    // Fetch guides and ensure we select all necessary fields
    const guides = await User.find(finalQuery).select("fullName avatar guideProfile createdAt");

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