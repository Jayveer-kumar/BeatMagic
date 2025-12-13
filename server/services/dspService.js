// import fs from "fs";
// import wav from "node-wav";
// import WavEncoder from "wav-encoder";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);
// // const wasmModule = require("../../wasm-build/audio.js");
// const wasmModule = require("../../server/wasm-build/audio");

// export async function applyEffect(inputPath, effect) {
//   const buffer = fs.readFileSync(inputPath);
//   const decoded = wav.decode(buffer);

//   let left = decoded.channelData[0];
//   let right = decoded.channelData[1];

//   const wasm = await wasmModule();

//   const len = left.length;

//   const leftPtr = wasm._malloc(len * 4);
//   const rightPtr = wasm._malloc(len * 4);

//   wasm.HEAPF32.set(left, leftPtr / 4);
//   wasm.HEAPF32.set(right, rightPtr / 4);

//   if (effect === "8d") {
//     wasm._process8D(leftPtr, rightPtr, len, 0.005);
//   }

//   const outLeft = new Float32Array(wasm.HEAPF32.buffer, leftPtr, len);
//   const outRight = new Float32Array(wasm.HEAPF32.buffer, rightPtr, len);

//   const outputWAV = await WavEncoder.encode({
//     sampleRate: decoded.sampleRate,
//     channelData: [outLeft, outRight],
//   });

//   const outputPath = "processed/output.wav";
//   fs.writeFileSync(outputPath, Buffer.from(outputWAV));

//   return outputPath;
// }

import fs from "fs";
import wav from "node-wav";
import WavEncoder from "wav-encoder";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
// import { wasmModule } from "../wasmLoader.js";

function convertMp3ToWav(mp3Path) {
  return new Promise((resolve, reject) => {
    const wavPath = mp3Path.replace(".mp3", ".wav");

    ffmpeg(mp3Path)
      .toFormat("wav")
      .audioChannels(2)
      .audioFrequency(44100)
      .on("end", () => resolve(wavPath))
      .on("error", reject)
      .save(wavPath);
  });
}

export async function applyEffect(inputPath, effect) {
  try {
    let wavPath = inputPath;

    // 🔥 Step 1: Convert MP3 → WAV
    if (inputPath.endsWith(".mp3")) {
      console.log("Converting MP3 to WAV...");
      wavPath = await convertMp3ToWav(inputPath);
    }

    // 🔥 Step 2: Decode WAV PCM data
    const buffer = fs.readFileSync(wavPath);
    const decoded = wav.decode(buffer);

    const left = decoded.channelData[0];
    const right = decoded.channelData[1] || decoded.channelData[0];

    const wasm = await wasmModule();
    const len = left.length;

    // 🔥 Step 3: Allocate memory
    const leftPtr = wasm._malloc(len * 4);
    const rightPtr = wasm._malloc(len * 4);

    wasm.HEAPF32.set(left, leftPtr >> 2);
    wasm.HEAPF32.set(right, rightPtr >> 2);

    // 🔥 Step 4: Apply effect
    if (effect === "8d") {
      wasm._process8D(leftPtr, rightPtr, len, 0.005);
    }

    const outLeft = new Float32Array(wasm.HEAPF32.buffer, leftPtr, len);
    const outRight = new Float32Array(wasm.HEAPF32.buffer, rightPtr, len);

    // 🔥 Step 5: Encode WAV back
    const outputWAV = await WavEncoder.encode({
      sampleRate: decoded.sampleRate,
      channelData: [outLeft, outRight],
    });

    const outputDir = "processed";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `output_${Date.now()}.wav`);
    fs.writeFileSync(outputPath, Buffer.from(outputWAV));

    // Cleanup temp WAV
    if (wavPath !== inputPath) fs.unlinkSync(wavPath);

    return outputPath;
  } catch (e) {
    console.error("DSP processing error:", e);
    throw e;
  }
}
