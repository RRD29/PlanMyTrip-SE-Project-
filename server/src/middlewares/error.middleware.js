import { ApiError } from "../utils/ApiError.js";


export const errorHandler = (err, req, res, next) => {
  
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      success: false,
      errors: err.errors,
    });
  }

  
  console.error("UNHANDLED ERROR:", err.stack); 

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    success: false,
    errors: [err.message],
  });
};