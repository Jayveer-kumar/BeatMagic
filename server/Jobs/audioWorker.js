// import { jobs } from "./jobStore.js";
import Jobs from "../models/Jobs.js";
import runPython from "../services/pythonService.js";
import { uploadToCloud , deleteFromCloud } from "../services/cloudService.js";
import Audio from "../models/Audio.js";
import CloudCleanup from "../models/CloudCleanup.js";
import downloadFromYoutube from "../services/youtubeService.js";


export const startAudioJob = async ({jobId,buffer,effect,systemAddress }) => {
  console.log("Start Audio job function is called : ");  
  const job = jobs.get(jobId); 
  if (!job) return;

  try {

    await Jobs.updateOne({jobId} , {status : "processing" , progress : 10})

    // Delete Old Data
    const old = await Audio.findOne({ systemAddress });
    if (old?.cloudPublicId) {
        let del = await deleteFromCloud(old.cloudPublicId);
        console.log("Old Song is Deleted from Cloud : See Below ");
        console.log(del);
    }
    await Audio.deleteMany({ systemAddress });

    await Jobs.updateOne({jobId}, {progress : 30})

    //  HEAVY PART 
    const outputBuffer = await runPython(buffer, effect);
    console.log("Song is converted successfully  : ");
    await Jobs.updateOne({jobId}, {progress : 70})

    //  Upload to cloud
    const upload = await uploadToCloud(outputBuffer);
    console.log("Song is uploaded to cloud Successfully : See ");
    console.log(upload);
    await Jobs.updateOne({jobId}, {progress : 90})

    await CloudCleanup.create({
      publicId: upload.publicId,
      safeAfter : new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    });

    await Audio.create({
      systemAddress,
      audioUrl: upload.url,
      cloudPublicId: upload.publicId,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await Jobs.updateOne({
      jobId
    }, {
      status: "done",
      progress: 100,
      url: upload.url
    });
  } catch (err) {
    await Jobs.updateOne({
      jobId
    }, {
      status: "error",
      error: err.message
    });
  }
};

export const startAudioJobFromUrl = async ({jobId,url,effect,systemAddress})=>{
  console.log("Start Audio job from url function is called : ");
  const job = jobs.get(jobId);
  if(!job) return;
  job.status = "processing";
  job.progress = 10;

  try {
    // 1. Delete from cloud and db if already exist for this system address
    const old = await Audio.findOne({ systemAddress });

    if (old?.cloudPublicId) await deleteFromCloud(old.cloudPublicId);
    await Audio.deleteMany({ systemAddress });
    job.progress = 30;

    // 2. Download from youtube
    const buffer  = await downloadFromYoutube(url);
    console.log("Song is downloaded from youtube successfully : ");
    job.progress = 50;
    // 3. Process with python
    const outputBuffer = await runPython(buffer , effect);
    console.log("Song is processed with python successfully : ");
    job.progress = 70;
    // 4. Upload to cloud
    const upload  = await uploadToCloud(outputBuffer);
    console.log("Song is uploaded to cloud successfully : ");
    console.log(upload);
    job.progress  = 90;

    // 5. Save to db
    await CloudCleanup.create({
      publicId: upload.publicId,
    });
    await Audio.create({
      systemAddress,
      audioUrl: upload.url,
      cloudPublicId: upload.publicId,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    // 6. Update job status and url
    job.status = "done";
    job.progress = 100;
    job.url = upload.url;

    console.log("Job is completed with progress 100 and with audio url See : ",upload.url);
  } catch (err) {
    console.error(
      "Some Error Occured in startAudioJobFromUrl function  : ",
      err,
    );
    job.status = "error";
    job.error = err.message;
  }
}