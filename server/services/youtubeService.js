import { exec } from "child_process";
import path from "path";
import fs from "fs";

// const downloadFromYoutube = (url) => {
//   return new Promise((resolve, reject) => {

//     console.log("Downloading from YouTube using yt-dlp...");

//     const outputPath = path.join("uploads", `${Date.now()}.mp3`);

//     const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

//     exec(command, (err) => {
//       if (err) {
//         console.log("yt-dlp download error:", err);
//         return reject(err);
//       }

//       console.log("Download complete:", outputPath);
//       resolve(outputPath);
//     });
//   });
// };

// export default downloadFromYoutube;


import { spawn } from "child_process";

const downloadFromYoutube = (url) => {
  return new Promise((resolve, reject) => {
    // const process = spawn("yt-dlp", [
    //   "-f", "bestaudio",
    //   "--audio-format", "mp3",
    //   "-o", "-",        // Output to STDOUT (stream)
    //   url
    // ]);

    const process = spawn("yt-dlp", [
      "-f",
      "bestaudio",
      "--audio-format",
      "mp3",
      "--extractor-args",
      "youtube:player_client=default",
      "-o",
      "-",
      url,
    ]);

    let chunks = [];

    process.stdout.on("data", (data) => {
      chunks.push(data);
    });

    process.stderr.on("data", (data) => {
      console.log("yt-dlp ERROR:", data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      } else {
        reject("yt-dlp failed with exit code: " + code);
      }
    });
  });
};

export default downloadFromYoutube;
