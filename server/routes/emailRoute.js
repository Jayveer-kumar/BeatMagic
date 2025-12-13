import express from "express";
const router = express.Router();
import { sendEmail , sendFeedback } from "../controllers/emailController.js";
import { feedbackRateLimit } from "../middleware/FeedbackRateLimit.js"; 

router.post("/sendEmail",sendEmail);
router.post("/feedback" , feedbackRateLimit ,  sendFeedback);

export default router; 
