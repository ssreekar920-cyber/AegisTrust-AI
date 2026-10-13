import logger from "../utils/logger.js";

/**
 * Central error handling middleware.
 * Enforces uniform error schema without leaking sensitive stack traces.
 */
export function errorHandler(err, req, res, _next) {
  logger.error("unhandled_error", {
    method: req.method,
    path: req.path,
    error: err.message,
  });

  // Zod validation error
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input parameters.",
        details: err.issues?.map((i) => ({ field: i.path.join("."), message: i.message })) || [],
      },
    });
  }

  // JWT authentication errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Authentication token invalid or expired.",
      },
    });
  }

  // Generic internal server error
  return res.status(err.status || 500).json({
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.userMessage || "An unexpected error occurred while processing the request.",
    },
  });
}

/**
 * 404 Route Not Found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
}

export default {
  errorHandler,
  notFoundHandler,
};
