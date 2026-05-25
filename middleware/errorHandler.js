const AppError = require("../utils/AppError");

/**
 * Global Express error-handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose: CastError (invalid ObjectId)
  if (err.name === "CastError") {
    error = new AppError(`Resource not found with id: ${err.value}`, 404);
  }

  // Mongoose: Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new AppError(
      `Duplicate value for field "${field}": "${value}". Please use a different value.`,
      409,
    );
  }

  // Mongoose: Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
    error = new AppError(message, 400);
  }

  // JWT errors (handled in auth middleware, but as a fallback)
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired. Please log in again.", 401);
  }

  res.status(error.statusCode).json({
    status: error.status || "error",
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
