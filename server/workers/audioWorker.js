import { Worker } from "bullmq";
import IORedis from "ioredis"
import Jobs from "../models/Jobs";
import runPython from "../services/pythonService";
import { uploadToCloud } from "../services/cloudService";

const connection = new IORedis(process.env.REDIS_URL);

export const audioWorker = new Worker(
  "audio-processing",
  async (job) => {
    const { jobId, buffer, effect, systemAddress } = job.data;

    await Jobs.findOneAndUpdate(
      { jobId },
      { status: "processing", progress: 10 }
    );

    //  ffmpeg + python
    const outputPath = await runPython(buffer, effect);

    await Jobs.findOneAndUpdate(
      { jobId },
      { progress: 70 }
    );

    const { url, publicId } = await uploadToCloud(outputPath);

    await Jobs.findOneAndUpdate(
      { jobId },
      {
        status: "done",
        progress: 100,
        url
      }
    );
  },
  { connection }
);