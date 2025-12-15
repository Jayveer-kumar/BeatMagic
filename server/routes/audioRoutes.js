import express from "express";
import upload from "../config/storage.js";
import { processUploaded, processFromURL , jobStatus } from "../controllers/audioController.js";
const router = express.Router();

router.post("/process-file", upload.single("audio"), processUploaded);
router.post("/process-url", upload.none(), processFromURL); 
router.get("/job-status/:jobId",jobStatus);

export default router; 
