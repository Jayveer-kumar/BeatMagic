import mongoose from "mongoose";

const CloudCleanupSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 // 1 HOUR AUTO DELETE (TESTING: 5 * 60)
  }
});

export default mongoose.model("CloudCleanup", CloudCleanupSchema);
