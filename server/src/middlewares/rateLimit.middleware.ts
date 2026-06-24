import rateLimit from "express-rate-limit";

/**
 * Loose global limiter — guards against blunt abuse across the whole API.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});

/**
 * Strict limiter for auth endpoints (login / register / refresh) to blunt
 * credential brute-forcing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, try again later.",
  },
});
