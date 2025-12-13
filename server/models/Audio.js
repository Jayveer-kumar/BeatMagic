import mongoose from "mongoose";

const AudioSchema = new mongoose.Schema({
  systemAddress: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
  },
  cloudPublicId: {
    type: String,
  },
  expireAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Audio", AudioSchema);
