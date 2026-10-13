import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Bearer JWT authentication middleware.
 * Attaches decoded payload to req.user = { id, role }
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token missing or malformed.",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role || "analyst",
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired authentication token.",
      },
    });
  }
}

export default authenticateToken;
