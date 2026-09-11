import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import audioRoutes from "./routes/audioRoutes.js";
import emailRoutes from "./routes/emailRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

//  CORS Middleware FIRST 
const corsOptions = {
  origin: "https://beatmagic.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(cors()); // For testing only

//  Body Parsers 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Serve Static Folders 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/processed", express.static(path.join(__dirname, "processed")));

//  Mongoose Options 
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
};

//  Database Connection 
async function main() {
  try {
    await mongoose.connect(process.env.ATLAS_URL, mongooseOptions);
    console.log("Database Connected :");

    // Start Cloud Cleanup Worker
    import("./workers/cloudCleanup.worker.js");

  } catch (err) {
    console.log(process.env.ATLAS_URL);
    console.error("MongoDB Connection Error :", err);
  }
}

main();

//  Long Request Timeout 
app.use((req, res, next) => {
  req.setTimeout(1000 * 60 * 10); // 10 min
  res.setTimeout(1000 * 60 * 10);
  next();
});

app.get("/", (req, res) => {
  res.status(200).send("Backend is running");
});


app.use("/api/audio", audioRoutes);
app.use("/api/email", emailRoutes);



app.get("/testapi", (req, res) => {
  const result = path.join(__dirname, "processed", "Barbaad Saiyaara 128 Kbps.mp3");
  res.sendFile(result, (err) => {
    if(err) {
      console.log("Error Sending File :", err);
      res.status(500).send("Error sending file");
    }
  });
});


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
server.setTimeout(15 * 60 * 1000); // 15 min

