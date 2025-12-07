// dotenv.config();
// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import path from "path";
// const PORT = process.env.PORT || 5000;
// const app = express();
// // Import audio routes
// import audioRoutes from "./routes/audioRoutes.js";

// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/processed", express.static(path.join(__dirname, "processed")));

// // use audio routes
// app.use("/api/audio", audioRoutes);

// app.listen(PORT, () => {
//     console.log(`✔ Server running on port ${PORT}`);
// });


import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

// Import audio routes
import audioRoutes from "./routes/audioRoutes.js";
import emailRoutes from "./routes/emailRoute.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/processed", express.static(path.join(__dirname, "processed")));

// use audio routes
app.use("/api/audio", audioRoutes);
app.use("/api/email",emailRoutes);


app.get("/testapi",(req,res)=>{
    console.log("Request Recieved : ");
    const result = path.join(__dirname, "processed", "1764957226550.wav");
    res.sendFile(result,(err)=>{
        if(err){
            console.log("Error Sending File :",err);
            res.status(500).send("Error sending file");
        }
    });
})

app.listen(PORT, () => {
  console.log(`✔ Server running on port ${PORT}`);
});