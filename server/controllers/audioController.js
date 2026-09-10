import Jobs from "../models/Jobs.js";
import { startAudioJob , startAudioJobFromUrl} from "../Jobs/audioWorker.js"; 
import { randomUUID } from "crypto";


export const processUploaded = async (req, res) => {
  console.log("Request Recived for Converting song to 8d by uploading song :  ");
  
  const { effect, systemAddress } = req.body;
  const buffer = req.file?.buffer; // <-- here we recieve buffer

  if (!buffer) return res.status(400).json({ error: "No file uploaded" });
  if (!effect) return res.status(400).json({ error: "No effect provided" });
  if (!systemAddress) return res.status(400).json({ error: "No systemAddress provided" });

  const jobId = randomUUID();

  await Jobs.create({
    jobId,
    status: "pending",
    progress: 0,
    error : null
  });
  
  console.log("Job is seted : ");
  // Background Work
  startAudioJob({
    jobId,
    buffer,
    effect,
    systemAddress
  })

  return res.json({
    success : true,
    jobId
  })

};

export const processFromURL = async (req, res) => {
  console.log("Request Recived for Converting song to 8d by url song :  ");
  const { effect, url, systemAddress } = req.body;

  if (!url) return res.status(400).json({ 
    success: false,
    message: "No URL Provided : "
  });
  if (!effect) return res.status(400).json({
    success: false,
    message: " No Effect Provided : "
  });
  if (!systemAddress) return res.status(400).json({
    success: false,
    message: "No System address Provided : "
  });

  const jobId = randomUUID();

  await Jobs.create({
    jobId,
    status: "pending",
    progress: 0,
    url: null,
    error: null
  });

  // Background Work
  startAudioJobFromUrl({
    jobId,
    url,
    effect,
    systemAddress
  });

  return res.json({
    success: true,
    jobId
  });
};

export const jobStatus = async (req, res) => {
  console.log("Request Recieved for Job status : ");
  const job = await Jobs.findOne({ jobId: req.params.jobId });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: `No any audio found for this ${req.params.jobId} job `
    });
  }

  return res.json({
    success: true,
    status: job.status,
    progress: job.progress,
    url: job.url,
    error: job.error
  });
};