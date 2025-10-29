/**
 * A standardized success response class for the API.
 * @param {number} statusCode - The HTTP status code (e.g., 200, 201)
 * @param {any} data - The data payload to send (e.g., user object, list of guides)
 * @param {string} [message="Success"] - A success message
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // 'success' is true for any status code < 400
  }
}

export { ApiResponse };