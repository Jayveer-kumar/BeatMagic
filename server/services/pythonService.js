// const { spawn } = require("child_process");

// exports.runPython = (inputPath, effect) => {
//   console.log("Running Python script with input:", inputPath, "and effect:", effect);
//   return new Promise((resolve, reject) => {
//     const outputPath = `processed/${Date.now()}.mp3`;

//     const python = spawn("python", [
//       "./audioEngine/process_audio.py",
//       inputPath,
//       outputPath,
//       effect
//     ]);

//     python.on("close", (code) => {
//       if (code === 0) resolve(outputPath);
//       else reject("Python script error");
//     });
//   });
// };


// const { spawn } = require("child_process");

// exports.runPython = (inputPath, effect) => {
//   console.log("Running Python script with input:", inputPath, "and effect:", effect);
//   return new Promise((resolve, reject) => {
//     const outputPath = `processed/${Date.now()}.mp3`;

//     const python = spawn("python", [
//       "./audioEngine/process_audio.py",
//       inputPath,
//       outputPath,
//       effect
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



// 7th try  Example
const { spawn } = require("child_process");

exports.runPython = (inputPath, effect) => {
  console.log("Running Python script with input:", inputPath, "and effect:", effect);

  return new Promise((resolve, reject) => {
    const outputPath = `processed/${Date.now()}.wav`; // Python WAV banata hai

    const python = spawn("python", [
      "./audioEngine/process_audio.py",
      inputPath,
      outputPath,
      "--preset",
      effect  // 3d, 8d, 16d
    ]);

    python.stdout.on("data", (data) => {
      console.log("PYTHON OUT:", data.toString());
    });

    python.stderr.on("data", (data) => {
      console.log("PYTHON ERROR:", data.toString());
    });

    python.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject("Python script error (exit code: " + code + ")");
    });
  });
};
