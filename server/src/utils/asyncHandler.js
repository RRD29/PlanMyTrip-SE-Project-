/**
 * A higher-order function that wraps async route handlers to catch errors
 * and pass them to the global error handler (next).
 *
 * @param {Function} requestHandler - The async controller function
 * @returns {Function} A new function that handles the request and catches errors
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // The requestHandler is an async function, so it returns a promise.
    // We resolve the promise and attach a .catch() to it.
    Promise.resolve(requestHandler(req, res, next))
           .catch((err) => next(err));
  };
};

export { asyncHandler };