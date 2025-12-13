import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// Upload file to Cloudinary
export const uploadToCloud = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "converted_audios",

        // Auto Delete After 1 Hour
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60)
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          expires_at: Math.floor(Date.now() / 1000) + (60 * 60)
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloud = async (publicId) => {
  console.log("Deleting from cloud:", publicId);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",   // IMPORTANT for wav files
      invalidate: true
    });

    console.log("Cloudinary Delete Result:", result);
  } catch (err) {
    console.error("Cloud Delete Error:", err);
  }
};

