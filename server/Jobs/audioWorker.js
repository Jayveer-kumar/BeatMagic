// import { jobs } from "./jobStore.js";
import Jobs from "../models/Jobs.js";
import runPython from "../services/pythonService.js";
import { uploadToCloud , deleteFromCloud } from "../services/cloudService.js";
import Audio from "../models/Audio.js";
import CloudCleanup from "../models/CloudCleanup.js";


export const startAudioJob = async ({
  jobId,
  buffer,
  effect,
  systemAddress
}) => {
  console.log("Start Audio job function is called : ");  
  try {

    await Jobs.updateOne({jobId} , {status : "processing" , progress : 10})

    // OLD DATA DELETE
    const old = await Audio.findOne({ systemAddress });
    if (old?.cloudPublicId) {
        let del = await deleteFromCloud(old.cloudPublicId);
        console.log("Old Song is Deleted from Cloud : See Below ");
        console.log(del);
    }
    await Audio.deleteMany({ systemAddress });

    await Jobs.updateOne({jobId}, {progress : 30})

    //  HEAVY PART (same as before)
    const outputBuffer = await runPython(buffer, effect);
    console.log("Song is converted successfully  : ");
    await Jobs.updateOne({jobId}, {progress : 70})

    //  CLOUD UPLOAD
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