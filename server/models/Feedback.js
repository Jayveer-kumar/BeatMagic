import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  name:{
    type:String,
    default:"Anonymous"
  },  
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, maxlength: 2000 },
  audioType: { type: String, enum: ["3D", "8D", "16d", "Other"], default: "Other" },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
