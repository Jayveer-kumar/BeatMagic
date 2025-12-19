import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  status: {
    type: String,
    enum: ["pending", "processing", "done", "error"],
    default: "pending"
  },

  progress: {
    type: Number,
    default: 0
  },

  url: {
    type: String,
    default: null
  },

  error: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 // auto remove job after 1 hour
  }
});

export default mongoose.model("Job", JobSchema);
