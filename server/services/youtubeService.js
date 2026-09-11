import { spawn } from "child_process";

const downloadFromYoutube = (url) => {
  return new Promise((resolve, reject) => {
    const process = spawn("yt-dlp", [
      "--config-location", "audioEngine/yt-dlp.conf",
      "-f", "bestaudio[ext=m4a]/bestaudio",
      "--extract-audio",
      "--audio-format", "wav",
      "-o", "-",
      url
    ]);

    let chunks = [];
    let stderrLog = "";

    process.stdout.on("data", (data) => chunks.push(data));
    process.stderr.on("data", (data) => {
      stderrLog += data.toString();
      console.log("yt-dlp:", data.toString());
    });

    process.on("close", (code) => {
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`yt-dlp failed (exit ${code}): ${stderrLog.slice(-300)}`));
      }
    });
  });
};

export default downloadFromYoutube;

// new method 28.02.2026

// import { spawn } from "child_process";

// const downloadFromYoutube = (url) => {
//   return new Promise((resolve, reject) => {

//     const process = spawn("yt-dlp", [
//       "-f", "bestaudio[ext=m4a]/bestaudio",
//       "--no-playlist",
//       "--extract-audio",
//       "--audio-format", "wav",
//       "--user-agent", "Mozilla/5.0",
//       "--add-header", "referer:youtube.com",
//       "-o", "-",
//       url
//     ]);

//     let chunks = [];

//     process.stdout.on("data", (data) => {
//       chunks.push(data);
//     });

//     process.stderr.on("data", (data) => {
//       console.log("yt-dlp:", data.toString());
//     });

//     process.on("close", (code) => {
//       if (code === 0) {
//         resolve(Buffer.concat(chunks));
//       } else {
//         reject("yt-dlp failed with exit code: " + code);
//       }
//     });
//   });
// };

// export default downloadFromYoutube;