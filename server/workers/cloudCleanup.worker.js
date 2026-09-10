import CloudCleanup from "../models/CloudCleanup.js";
import { deleteFromCloud } from "../services/cloudService.js";

console.log(" Cloud cleanup worker started");

setInterval(async () => {
  console.log("Cloud Cleanup Function Re-started : ");

  try {
    const expired = await CloudCleanup.find({
      safeAfter: { $lte: new Date() }
    });

    for (const item of expired) {
      console.log("Deleting safely:", item.publicId);

      await deleteFromCloud(item.publicId);
      await item.deleteOne();
    }

  } catch (err) {
    console.error("Cloud cleanup error:", err);
  }
}, 60 * 1000);

// setInterval(async () => {
//   console.log("Cloud Cleanup Function Re-started : ");
//   try {
//     const expired = await CloudCleanup.find({
//       createdAt: { $lte: new Date(Date.now() - 60 * 60 * 1000) } // for 1 hour
//     });

//     for (const item of expired) {
//         console.log("Single Item : ");
//         console.log(item);
//       await deleteFromCloud(item.publicId);
//       await item.deleteOne();
//     }

//   } catch (err) {
//     console.error("Cloud cleanup error:", err);
//   }
// }, 60 * 1000); // every 1 minute
