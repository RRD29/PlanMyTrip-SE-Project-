/**
 * A standardized error class for API errors.
 * @param {number} statusCode - The HTTP status code (e.g., 404, 401, 500)
 * @param {string} [message="Something went wrong"] - The error message
 * @param {Array} [errors=[]] - Optional: An array of more specific errors
 * @param {string} [stack=""] - Optional: The error stack trace
 */
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // 'data' is null in an error response
    this.message = message;
    this.success = false; // 'success' is always false for an error
    this.errors = errors;

    // Capture the stack trace if provided, otherwise generate a new one
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };