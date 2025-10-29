import { ApiError } from "../utils/ApiError.js";

/**
 * Global error handling middleware.
 * This should be the last middleware added in your app.js.
 */
export const errorHandler = (err, req, res, next) => {
  // Check if the error is an instance of our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      success: false,
      errors: err.errors,
    });
  }

  // Handle other unexpected or unhandled errors
  console.error("UNHANDLED ERROR:", err.stack); // Log the full error stack for debugging

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    success: false,
    errors: [err.message],
  });
};