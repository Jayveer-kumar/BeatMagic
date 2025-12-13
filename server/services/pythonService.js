// import { spawn } from "child_process";

// const runPython = (inputPath, effect) => {
//   console.log("Running Python script with input:", inputPath, "and effect:", effect);

//   return new Promise((resolve, reject) => {
//     const outputPath = `/tmp/${Date.now()}.wav`; // Python WAV banata hai

//     const python = spawn("python", [
//       "./audioEngine/process_audio.py",
//       inputPath,
//       outputPath,
//       "--preset",
//       effect  // 3d, 8d, 16d
//     ]);

//     python.stdout.on("data", (data) => {
//       console.log("PYTHON OUT:", data.toString());
//     });

//     python.stderr.on("data", (data) => {
//       console.log("PYTHON ERROR:", data.toString());
//     });

//     python.on("close", (code) => {
//       if (code === 0) resolve(outputPath);
//       else reject("Python script error (exit code: " + code + ")");
//     });
//   });
// };

// export default runPython;


// Python se WAV generate hone do

// Node side me WAV file ko readFileSync se buffer me convert karo

// WAV file ko immediately delete kar do

// Buffer return kar do

// import { spawn } from "child_process";
// import fs from "fs";
// import os from "os";


// const runPython = (inputBuffer, effect) => {
//   return new Promise((resolve, reject) => {
//     const tmp = os.tmpdir();
//     const inputPath = `/${tmp}/input_${Date.now()}.mp3`;
//     const outputPath = `/${tmp}/output_${Date.now()}.wav`;

//     // Step-1: Buffer ko temporary file me save (sirf Python requirement)
//     fs.writeFileSync(inputPath, inputBuffer);

//     const python = spawn("python", [
//       "./audioEngine/process_audio.py",
//       inputPath,
//       outputPath,
//       "--preset",
//       effect
//     ]);

//     python.stdout.on("data", (data) => {
//       console.log("PYTHON OUT:", data.toString());
//     });

//     python.stderr.on("data", (data) => {
//       console.log("PYTHON ERROR:", data.toString());
//     });

//     python.on("close", (code) => {
//       if (code !== 0) return reject("Python failed");

//       // Step-2: Output WAV ko buffer me convert
//       const outputBuffer = fs.readFileSync(outputPath);

//       // Step-3: Temp files delete
//       fs.unlinkSync(inputPath);
//       fs.unlinkSync(outputPath);

//       resolve(outputBuffer);
//     });
//   });
// };

// export default runPython;



// import path from "path";
// import { spawn } from "child_process";
// import fs from "fs";
// import os from "os";

// const runPython = (inputBuffer, effect) => {
//   return new Promise((resolve, reject) => {
//     const tmp = os.tmpdir();

//     const inputPath = path.join(tmp, `input_${Date.now()}.mp3`);
//     const outputPath = path.join(tmp, `output_${Date.now()}.wav`);

//     // Save input audio file
//     fs.writeFileSync(inputPath, inputBuffer);

//     const python = spawn("python", [
//       "./audioEngine/process_audio.py",
//       inputPath,
//       outputPath,
//       "--preset",
//       effect
//     ]);

//     python.stdout.on("data", (data) => {
//       console.log("PYTHON OUT:", data.toString());
//     });

//     python.stderr.on("data", (data) => {
//       console.log("PYTHON ERROR:", data.toString());
//     });

//     python.on("close", (code) => {
//       if (code !== 0) return reject("Python failed");

//       const outputBuffer = fs.readFileSync(outputPath);

//       fs.unlinkSync(inputPath);
//       fs.unlinkSync(outputPath);

//       resolve(outputBuffer);
//     });
//   });
// };

// export default runPython;


// import { spawn } from "child_process";
// import path from "path";
// import fs from "fs/promises";
// import os from "os";
// import { randomUUID } from "crypto";

// export const convertToWav = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const ff = spawn("ffmpeg", [
//       "-i", "pipe:0",
//       "-f", "wav",
//       "-ac", "2",
//       "-ar", "44100",
//       "pipe:1"
//     ]);

//     let chunks = [];

//     ff.stdout.on("data", (d) => chunks.push(d));
//     ff.stderr.on("data", (d) => console.log("FFMPEG:", d.toString()));

//     ff.on("close", (code) => {
//       if (code === 0) resolve(Buffer.concat(chunks));
//       else reject("FFmpeg failed");
//     });

//     ff.stdin.write(buffer);
//     ff.stdin.end();
//   });
// };


// const runPython = async (inputBuffer, effect) => {
//   const wavBuffer = await convertToWav(inputBuffer);
//   return new Promise((resolve, reject) => {

//     const python = spawn("python", [
//       "./audioEngine/process_audio.py",
//       "-",       // input from stdin
//       "-",       // output to stdout
//       "--preset",
//       effect
//     ]);

//     let outputChunks = [];
//     let errorData = "";

//     // Collect processed output from Python
//     python.stdout.on("data", (data) => {
//       outputChunks.push(data);
//     });

//     // Collect errors
//     python.stderr.on("data", (data) => {
//       errorData += data.toString();
//       console.log("PYTHON ERROR:", data.toString());
//     });

//     python.on("close", (code) => {
//       if (code !== 0) {
//         return reject(new Error(`Python failed: ${errorData}`));
//       }

//       const outputBuffer = Buffer.concat(outputChunks);
//       resolve(outputBuffer);
//     });

//     python.on("error", (err) => {
//       reject(new Error(`Python spawn error: ${err.message}`));
//     });

//     // Send input buffer to python stdin
//     python.stdin.write(inputBuffer);
//     python.stdin.end();
//   });
// };

// export default runPython;


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
