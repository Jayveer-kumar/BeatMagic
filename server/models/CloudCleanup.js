import mongoose from "mongoose";

const CloudCleanupSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true
  },
  // Cleanup kab allowed hai
  safeAfter :{
    type : Date,
    required : true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60 // 1 HOUR AUTO DELETE (TESTING: 60 * 60)
  }
});

export default mongoose.model("CloudCleanup", CloudCleanupSchema);
