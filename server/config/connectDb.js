import mongoose from "mongoose";

//  Mongoose Options 
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
};



export const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.ATLAS_URL , mongooseOptions);
        console.log("Database Connected Successfully : ");

    } catch (err) {
        console.error("Some Error while Connecting to Database  :")
    }
}

//  Database Connection 
// export const async function connectDB() {
//   try {
//     await mongoose.connect(process.env.ATLAS_URL, mongooseOptions);
//     console.log("Database Connected :");

//     // Start Cloud Cleanup Worker
//     import("./workers/cloudCleanup.worker.js");

//   } catch (err) {
//     console.error("MongoDB Connection Error :", err);
//   }
// }

