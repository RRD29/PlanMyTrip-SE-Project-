import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import config from '../config/index.js';

/**
 * Verifies the JWT token from either the cookies or the Authorization header.
 * If valid, it attaches the user object to the request (req.user).
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request. No token provided.");
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      // User not found in DB (e.g., deleted user, invalid token)
      throw new ApiError(401, "Invalid Access Token.");
    }

    req.user = user; // Attach the user to the request object
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, "Invalid Access Token.");
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, "Access Token expired.");
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

/**
 * Middleware to check if the logged-in user has one of the required roles.
 * @param  {...string} roles - An array of roles (e.g., "admin", "guide")
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // This middleware must run *after* verifyJWT, so req.user will exist
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403, // Forbidden
        `Forbidden: Role (${req.user.role}) is not authorized to access this resource.`
      );
    }
    next();
  };
};

/*
// --- How to use these in your routes (e..g, server/src/routes/user.routes.js) ---
//
// router.route("/profile").get(verifyJWT, getMyProfile); // Only logged-in users
//
// router.route("/admin/all").get(verifyJWT, authorizeRole("admin"), getAllUsers); // Only admins
//
// router.route("/guide/dashboard").get(verifyJWT, authorizeRole("guide"), getGuideDashboard); // Only guides
//
// router.route("/chat").post(verifyJWT, authorizeRole("user", "guide"), postMessage); // Users or Guides
*/