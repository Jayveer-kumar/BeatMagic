import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
// Import audio routes
import audioRoutes from "./routes/audioRoutes.js";
import emailRoutes from "./routes/emailRoute.js";
import { applyEffect } from "./services/dspService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
};

async function main() {
  try {
    await mongoose.connect(process.env.ATLAS_URL,mongooseOptions);
    console.log("Database Connected :");

    // START CLEANUP WORKER AFTER DB CONNECT
    await import("./workers/cloudCleanup.worker.js");


  } catch (err) {
    console.error("MongoDB Connection Error :", err);
  }
}

main();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/processed", express.static(path.join(__dirname, "processed")));

async function test(){
    try {
        const inputFile = 'uploads/1765271529955.mp3';
        console.log("Testing DSP Service : ");
        const output = await applyEffect(inputFile,'8d',{speed : 0.005});
        console.log("Test Successfull : ");
        console.log("Output file : ",output);                
    } catch (err) {
        console.error("Test Failed : ");
        process.exit(1);        
    }
}

// test();

// use audio routes
app.use((req, res, next) => {
  req.setTimeout(1000 * 60 * 10);
  res.setTimeout(1000 * 60 * 10);
  next();
});


app.use("/api/audio", audioRoutes);
app.use("/api/email",emailRoutes);


app.get("/testapi",(req,res)=>{
    console.log("Request Recieved : ");
    const result = path.join(__dirname,"processed","Barbaad Saiyaara 128 Kbps.mp3");
    res.sendFile(result,(err)=>{
        if(err){
            console.log("Error Sending File :",err);
            res.status(500).send("Error sending file");
        }
    });
})

const server= app.listen(PORT, () => {
  console.log(`✔ Server running on port ${PORT}`);
});

server.setTimeout(15 * 60 * 1000);






// YouTube URL → Buffer  
// Upload File → Buffer  
// ↓
// runPython(buffer) → processedBuffer  
// ↓
// uploadToCloud(processedBuffer)
// ↓
// Delete old DB
// ↓
// Save new DB entry
