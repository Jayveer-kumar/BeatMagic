// import { Module as ModuleConfig } from "./wasmModuleConfig.js";

// // IMPORTANT: audio.js will use this Module object
// global.Module = ModuleConfig;

// import "./wasm-build/audio.js"; // this auto-loads WASM using global.Module

// export async function wasmModule() {
//   // If already initialized, resolve immediately
//   if (global.Module.calledRun) {
//     return global.Module;
//   }

//   return new Promise((resolve, reject) => {
//     global.Module.onRuntimeInitialized = () => {
//       console.log("✅ WASM Loaded Successfully");
//       resolve(global.Module);
//     };

//     setTimeout(() => {
//       reject(new Error("WASM init timeout"));
//     }, 8000);
//   });
// }
