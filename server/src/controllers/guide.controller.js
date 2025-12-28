import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const getAllGuides = asyncHandler(async (req, res) => {
    
    const { location, search, minPrice, maxPrice, minRating, minExperience, destination } = req.query;

    
    const filters = [{ role: 'guide' }];

    
    const textSearchConditions = [];
    if (search) {
        textSearchConditions.push(
            { fullName: { $regex: search, $options: 'i' } },
            { 'guideProfile.bio': { $regex: search, $options: 'i' } }
        );
    }
    if (location) {
        
        textSearchConditions.push({ 'guideProfile.expertiseRegions': { $regex: location, $options: 'i' } });
    }
    if (destination) {
        
        textSearchConditions.push({ 'guideProfile.expertiseRegions': { $regex: destination, $options: 'i' } });
    }
    
    
    if (textSearchConditions.length > 0) {
        filters.push({ $or: textSearchConditions });
    }

    
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

    
    
    const finalQuery = filters.length > 1 ? { $and: filters } : { role: 'guide' };

    
    const guides = await User.find(finalQuery).select("fullName avatar guideProfile createdAt");

    return res.status(200).json(
        new ApiResponse(200, guides, "Guides fetched successfully")
    );
});


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