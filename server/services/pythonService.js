import path from "path";
import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import { randomUUID } from "crypto";

/* --------------------------------------------------
   CONVERT ANY AUDIO BUFFER → WAV (44100Hz / Stereo)
-------------------------------------------------- */
export const convertToWav = (buffer) => {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-i", "pipe:0",      // Input from buffer
      "-f", "wav",
      "-ac", "2",          // Stereo
      "-ar", "44100",      // 44.1 kHz
      "pipe:1"             // Output as buffer
    ]);

    let chunks = [];

    ff.stdout.on("data", (d) => chunks.push(d));

    ff.stderr.on("data", (d) => {
      console.log("FFMPEG:", d.toString());
    });

    ff.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error("FFmpeg failed with code " + code));
      }
    });

    ff.stdin.write(buffer);
    ff.stdin.end();
  });
};

/* --------------------------------------------------
   RUN PYTHON SCRIPT USING WAV INPUT
-------------------------------------------------- */
const runPython = (inputBuffer, effect) => {
  return new Promise(async (resolve, reject) => {
    const tmpDir = os.tmpdir();
    const id = randomUUID();

    const inputPath = path.join(tmpDir, `input_${id}.wav`);
    const outputPath = path.join(tmpDir, `output_${id}.wav`);

    const cleanup = async () => {
      for (const p of [inputPath, outputPath]) { 
        try {
          await fs.unlink(p);
        } catch {}
      }
    };

    try {
      /* ---- STEP 1: Convert Buffer → WAV ---- */
      const wavBuffer = await convertToWav(inputBuffer);

      /* ---- STEP 2: Save Temp WAV File ---- */
      await fs.writeFile(inputPath, wavBuffer);

      /* ---- STEP 3: Run Python ---- */
      const python = spawn("python", [
        "./audioEngine/process_audio.py",
        inputPath,
        outputPath,
        "--preset",
        effect
      ]);

      let errorOutput = "";

      python.stdout.on("data", (d) => console.log("PYTHON:", d.toString()));
      python.stderr.on("data", (d) => {
        errorOutput += d.toString();
        console.log("PYTHON ERROR:", d.toString());
      });

      python.on("close", async (code) => {
        if (code !== 0) {
          await cleanup();
          return reject(new Error("Python failed: " + errorOutput));
        }

        try {
          /* ---- STEP 4: Read Output WAV ---- */
          const processed = await fs.readFile(outputPath);

          await cleanup();
          resolve(processed);

        } catch (error) {
          await cleanup();
          reject(new Error("Output file missing"));
        }
      });

      python.on("error", async (err) => {
        await cleanup();
        reject(new Error("Python spawn error: " + err.message));
      });

    } catch (err) {
      await cleanup();
      reject(err);
    }
  });
};

export default runPython;
