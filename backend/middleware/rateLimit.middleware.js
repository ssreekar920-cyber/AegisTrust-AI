import rateLimit from "express-rate-limit";

/**
 * Rate limiter: 30 requests per minute per IP for security endpoints.
 */
export const securityRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Gateway allows up to 30 requests per minute per IP.",
      },
    });
  },
});

export default securityRateLimiter;
