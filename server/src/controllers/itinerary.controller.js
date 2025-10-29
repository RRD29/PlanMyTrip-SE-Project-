import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
// We will create this service later
// import { generateItineraryService } from '../services/itinerary.service.js';

// --- Generate Itinerary ---
export const generateItinerary = asyncHandler(async (req, res) => {
    const { destination, days, budget, interests } = req.body;
    const userId = req.user._id;

    if (!destination || !days) {
        throw new ApiError(400, "Destination and number of days are required");
    }

    // MOCK RESPONSE FOR NOW
    // In a real app, you would call your AI service
    // const itinerary = await generateItineraryService({ destination, days, budget, interests });
    const mockItinerary = {
        destination: destination,
        days: days,
        plan: [
            { day: 1, title: "Arrival & City Center", activities: ["Check into hotel", "Explore Old Town Square"] },
            { day: 2, title: "Museum Hopping", activities: ["Visit National Museum", "Lunch at local cafe"] },
        ]
    };
    // ----------------------

    return res.status(200).json(
        new ApiResponse(200, mockItinerary, "Itinerary generated successfully")
    );
});