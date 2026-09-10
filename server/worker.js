import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import "./workers/audioWorker";
import "./workers/cloudCleanup.worker";

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
};

mongoose
  .connect(process.env.ATLAS_URL, mongooseOptions)
  .then(() => console.log("Worker DB connected"))
  .catch(console.error);