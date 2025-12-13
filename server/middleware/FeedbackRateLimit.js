import rateLimit from "express-rate-limit";

export const feedbackRateLimit = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 3,                    // 3 requests per minute
  message: {
    success: false,
    message: "Too many feedback submissions. Please try again later."
  }
});
