const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports.downloadFromYoutube = (url) => {
  return new Promise((resolve, reject) => {

    console.log("Downloading from YouTube using yt-dlp...");

    const outputPath = path.join("uploads", `${Date.now()}.mp3`);

    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

    exec(command, (err) => {
      if (err) {
        console.log("yt-dlp download error:", err);
        return reject(err);
      }

      console.log("Download complete:", outputPath);
      resolve(outputPath);
    });
  });
};
