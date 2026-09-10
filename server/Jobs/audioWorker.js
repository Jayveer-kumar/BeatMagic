import Jobs from "../models/Jobs.js";
import runPython from "../services/pythonService.js";
import { uploadToCloud, deleteFromCloud } from "../services/cloudService.js";
import Audio from "../models/Audio.js";
import CloudCleanup from "../models/CloudCleanup.js";
import downloadFromYoutube from "../services/youtubeService.js";

export const startAudioJob = async ({ jobId, buffer, effect, systemAddress }) => {
  console.log("Start Audio job function is called : ");
  try {
    await Jobs.updateOne({ jobId }, { status: "processing", progress: 10 });

    const old = await Audio.findOne({ systemAddress });
    if (old?.cloudPublicId) {
      let del = await deleteFromCloud(old.cloudPublicId);
      console.log("Old Song is Deleted from Cloud : See Below ");
      console.log(del);
    }
    await Audio.deleteMany({ systemAddress });

    await Jobs.updateOne({ jobId }, { progress: 30 });

    const outputBuffer = await runPython(buffer, effect);
    console.log("Song is converted successfully  : ");
    await Jobs.updateOne({ jobId }, { progress: 70 });

    const upload = await uploadToCloud(outputBuffer);
    console.log("Song is uploaded to cloud Successfully : See ");
    console.log(upload);
    await Jobs.updateOne({ jobId }, { progress: 90 });

    await CloudCleanup.create({
      publicId: upload.publicId,
      safeAfter: new Date(Date.now() + 30 * 60 * 1000)
    });

    await Audio.create({
      systemAddress,
      audioUrl: upload.url,
      cloudPublicId: upload.publicId,
      expireAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    await Jobs.updateOne({ jobId }, { status: "done", progress: 100, url: upload.url });
  } catch (err) {
    await Jobs.updateOne({ jobId }, { status: "error", error: err.message });
  }
};

export const startAudioJobFromUrl = async ({ jobId, url, effect, systemAddress }) => {
  console.log("Start Audio job from url function is called : ");
  try {
    await Jobs.updateOne({ jobId }, { status: "processing", progress: 10 });

    const old = await Audio.findOne({ systemAddress });
    if (old?.cloudPublicId) await deleteFromCloud(old.cloudPublicId);
    await Audio.deleteMany({ systemAddress });

    await Jobs.updateOne({ jobId }, { progress: 30 });

    const buffer = await downloadFromYoutube(url);
    console.log("Song is downloaded from youtube successfully : ");
    await Jobs.updateOne({ jobId }, { progress: 50 });

    const outputBuffer = await runPython(buffer, effect);
    console.log("Song is processed with python successfully : ");
    await Jobs.updateOne({ jobId }, { progress: 70 });

    const upload = await uploadToCloud(outputBuffer);
    console.log("Song is uploaded to cloud successfully : ");
    console.log(upload);
    await Jobs.updateOne({ jobId }, { progress: 90 });

    await CloudCleanup.create({ publicId: upload.publicId });

    await Audio.create({
      systemAddress,
      audioUrl: upload.url,
      cloudPublicId: upload.publicId,
      expireAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    await Jobs.updateOne({ jobId }, { status: "done", progress: 100, url: upload.url });
    console.log("Job is completed with progress 100 and with audio url See : ", upload.url);
  } catch (err) {
    console.error("Some Error Occured in startAudioJobFromUrl function  : ", err);
    await Jobs.updateOne({ jobId }, { status: "error", error: err.message });
  }
};