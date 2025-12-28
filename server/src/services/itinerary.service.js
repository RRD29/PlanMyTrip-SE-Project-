import { ApiError } from "../utils/ApiError.js";


export const generateItineraryService = async (details) => {
  const { destination, days, interests } = details;

  
  await new Promise(resolve => setTimeout(resolve, 500));

  if (destination.toLowerCase().includes("fail")) {
    throw new ApiError(500, "AI service failed to generate itinerary.");
  }

  const mockPlan = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${destination}`,
    activities: [
      `Morning: Explore a local market (based on interest: ${interests?.join(', ') || 'general'})`,
      `Afternoon: Visit a key landmark`,
      `Evening: Dinner at a recommended local restaurant`,
    ],
  }));

  return {
    destination: destination,
    days: days,
    plan: mockPlan,
    estimatedCost: Math.random() * 500 + 100 * days,
  };
};