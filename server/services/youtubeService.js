import { exec } from "child_process";
import path from "path";
import fs from "fs";


// Cookie methods 28.02.2026

// import { spawn } from "child_process";

// const downloadFromYoutube = (url) => {
//   return new Promise((resolve, reject) => {
//     // const process = spawn("yt-dlp", [
//     //   "-f", "bestaudio",
//     //   "--audio-format", "mp3",
//     //   "-o", "-",        // Output to STDOUT (stream)
//     //   url
//     // ]);

//     const process = spawn("yt-dlp", [
//       "--cookies", "cookies.txt",
//       "-f","bestaudio",
//       "--audio-format","mp3",
//       "--extractor-args","youtube:player_client=android",
//       "-o",
//       "-",
//       url,
//     ]);

//     let chunks = [];

//     process.stdout.on("data", (data) => {
//       chunks.push(data);
//     });

//     process.stderr.on("data", (data) => {
//       console.log("yt-dlp ERROR:", data.toString());
//     });

//     process.on("close", (code) => {
//       if (code === 0) {
//         const buffer = Buffer.concat(chunks);
//         resolve(buffer);
//       } else {
//         reject("yt-dlp failed with exit code: " + code);
//       }
//     });
//   });
// };

// export default downloadFromYoutube; 



// new method 28.02.2026

import { spawn } from "child_process";

const downloadFromYoutube = (url) => {
  return new Promise((resolve, reject) => {

    const process = spawn("yt-dlp", [
      "-f", "bestaudio[ext=m4a]/bestaudio",
      "--no-playlist",
      "--extract-audio",
      "--audio-format", "wav",
      "--user-agent", "Mozilla/5.0",
      "--add-header", "referer:youtube.com",
      "-o", "-",
      url
    ]);

    let chunks = [];

    process.stdout.on("data", (data) => {
      chunks.push(data);
    });

    process.stderr.on("data", (data) => {
      console.log("yt-dlp:", data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject("yt-dlp failed with exit code: " + code);
      }
    });
  });
};

export default downloadFromYoutube;