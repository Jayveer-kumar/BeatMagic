import Audio from "../models/Audio.js";
import downloadFromYoutube from "../services/youtubeService.js";
import runPython from "../services/pythonService.js";
import { uploadToCloud, deleteFromCloud } from "../services/cloudService.js";
import fs from "fs";
import CloudCleanup from "../models/CloudCleanup.js";
// import { jobs } from "../Jobs/jobStore.js";
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

  try {
    // OLD DATA DELETE
    const old = await Audio.findOne({ systemAddress });

    if (old?.cloudPublicId) await deleteFromCloud(old.cloudPublicId);
    await Audio.deleteMany({ systemAddress });

    // PROCESS WITH PYTHON USING BUFFER
    const outputBuffer = await runPython(buffer, effect);

    // UPLOAD TO CLOUD
    const upload = await uploadToCloud(outputBuffer);

    //  CLOUD CLEANUP ENTRY
    await CloudCleanup.create({
      publicId: upload.publicId,
    });

    // SAVE DB
    await Audio.create({
      systemAddress,
      audioUrl: upload.url,
      cloudPublicId: upload.publicId,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    return res.json({ success: true, url: upload.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Processing failed" });
  }
};


export const processFromURL = async (req, res) => {
  console.log("Request Recived for Converting song to 8d by url song :  ");
  const { effect, url, systemAddress } = req.body;

  if (!url) return res.status(400).json({ 
    success : false,
    message : "No URL Provided : "
  });
  if (!effect) return res.status(400).json({
    success : false,
    message : " No Effect Provided : "
   });
  if (!systemAddress) return res.status(400).json({
    success: false,
    message : "No System address Provided : "
  });

  const jobId = randomUUID();

  Jobs.set(jobId,{
    status : "Pending",
    progress : 0,
    url : null,
    error : null
  })

  startAudioJobFromUrl({
    jobId,
    url,
    effect,
    systemAddress
  })

  return res.json({
    success : true,
    jobId
  })



  try {
    // OLD DATA DELETE
    const old = await Audio.findOne({ systemAddress });

    if (old?.cloudPublicId) await deleteFromCloud(old.cloudPublicId);
    await Audio.deleteMany({ systemAddress });

    // DOWNLOAD FROM YOUTUBE
    const rawBuffer   = await downloadFromYoutube(url); 

    // PROCESS WITH PYTHON
    const processedBuffer = await runPython(rawBuffer, effect);

    // UPLOAD TO CLOUD
    const upload = await uploadToCloud(processedBuffer);
    console.log("Song is uploaded  to cloud success : see->");
    console.log(upload);

    //  CLOUD CLEANUP ENTRY
    await CloudCleanup.create({
      publicId: upload.publicId,
    });

    // SAVE DB
    await Audio.create({
      systemAddress,
      audioUrl: upload.url,
      cloudPublicId: upload.publicId,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    console.log("Done Enjoy Your Music : ");

    return res.json({ success: true, url: upload.url });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Processing failed" });
  }

};

export const jobStatus = async (req,res) =>{
  console.log("Request Recieved for Job status : ");
  const job = Jobs.get(req.params.jobId);
  if(!job){
    return res.status(404).json({success : false , message : `No any audio found for this ${req.params.jobId} job `});
  }

  return res.json({
    success: true,
    status: job.status,
    progress: job.progress,
    url: job.url,
    error: job.error
  });
};
