// src/components/Hero.jsx
import React, { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Loader from "../components/Loader";
import { uploadAudio } from "../utils/Api";
import {   Headphones } from "lucide-react";
import AlertMessage from "../components/Alert";

const PRESETS = ["3d", "8d", "16d","lofi"];

export default function Hero() {
  // mode = "upload" or "url"
  const [mode, setMode] = useState(() => {
    const qp = new URLSearchParams(window.location.search).get("mode");
    return qp === "url" ? "url" : "upload";
  });

  const [ alert , setAlert ] = useState({
    open:false,
    type:"success",
    message:""
  })

  // file/url state
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [preset, setPreset] = useState("8d");

  // UI state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [ visibleOutput , setVisibleOutput ] = useState(true);

  // Typed effect ref
  const typedRef = useRef(null);
  const typedEl = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedEl.current, {
      strings: [        
        "Immersive Sound",
        "Spatial Rotation",
        "Binaural Motion",
        "Dynamic 16D Audio"
      ],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1300,
      startDelay: 300,
      loop: true,
      showCursor: false,
    });
    typedRef.current = typed;
    return () => typed.destroy();
  }, []);

  // update query param when mode changes
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    q.set("mode", mode);
    const newUrl = `${window.location.pathname}?${q.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [mode]);

  // drag & drop handlers
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      const f = dt.files[0];
      acceptFile(f);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function acceptFile(f) {
    // simple validation
    const allowed = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp3",
      "audio/aac",
      "audio/x-aac",
    ];
    // fallback: accept any file with audio ext if MIME missing
    if (
      !f.type ||
      allowed.includes(f.type) ||
      /\.(mp3|wav|aac|m4a)$/i.test(f.name)
    ) {
      setFile(f);
      setFileName(`${f.name} • ${(f.size / (1024 * 1024)).toFixed(2)} MB`);
      setError("");
    } else {
      setError("Unsupported file format. Use MP3/WAV/AAC.");
    }
  }

  function onFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      acceptFile(e.target.files[0]);
    }
  }

  // async function handleConvert() {
  //   setError("");
  //   setResult(null);

  //   if (mode === "upload") {
  //     if (!file) {
  //       setError("Please choose a file to upload.");
  //       return;
  //     }
  //   } else {
  //     // url mode
  //     if (!urlInput || !/^https?:\/\//i.test(urlInput)) {
  //       setError("Please paste a valid URL (starting with http/https).");
  //       return;
  //     }
  //   }

  //   setUploading(true);
  //   // setProcessing(false);
  //   setProgress(0);

  //   try {
  //     const res = await uploadAudio({
  //       file: mode === "upload" ? file : null,
  //       url: mode === "url" ? urlInput : null,
  //       preset,
  //       onProgress: (p) => setProgress(p),
  //     });

  //     setResult({
  //       ...res,
  //       downloadUrl: `http://localhost:8080/${res.result}`,
  //     });

  //     setFileName("");
  //     setUrlInput("");

  //     setUploading(false);
  //     setProgress(100);
  //   } catch (err) {
  //     setError(err.message || "Upload failed");
  //     setUploading(false);
  //     setProgress(0);
  //   }
  // }

  async function handleConvert() {
  setError("");
  setResult(null);

  if (mode === "upload") {
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
  } else {
    if (!urlInput || !/^https?:\/\//i.test(urlInput)) {
      setError("Please paste a valid URL.");
      return;
    }
  }

  setUploading(true); 
  setProcessing(false);
  setProgress(0);

  try {
    const res = await uploadAudio({
      file: mode === "upload" ? file : null,
      url: mode === "url" ? urlInput : null,
      preset,
      onProgress: (p) =>{
        setProgress(p);
        if(p===100){
          setUploading(false);
          setProcessing(true);
        }
      }
    });

    // Upload finished → show processing loader
    setProcessing(false);

    // simulate small delay if needed
    setTimeout(() => {
      setResult({
        ...res,
        downloadUrl: `http://localhost:8080/${res.result}`,
      });
      setFile(null);
      setFileName("");
      setUrlInput("");
      setProgress(100);
    }, 300); // optional
    setAlert({
      open:true,
      type:"success",
      message:"Audio Converted Successfully!"
    })
  } catch (err) {
    setAlert({
      open:true,
      type:"error",
      message:"Something went wrong please try later :"
    })
    setError(err.message);
    setUploading(false);
    setProcessing(false);
    setProgress(0);
  }
}


  function clearSelection() {
    setFile(null);
    setFileName("");
    setUrlInput("");
    setResult(null);
    setError("");
  }


  return (
    <section id="Home" className="HeroSection px-5 w-full min-h-screen bg-gradient-to-br from-black via-[#061020] to-[#0b1220] text-white flex items-center pt-20">
      <div className="w-full max-w-screen-2xl mx-auto px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* LEFT: Heading */}
          <div className="md:col-span-7">
            <h2 className="text-xl text-[#9CA3AF] mb-4">BeatMagic</h2>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Transform your music into <br />
              <span className="text-white">3D • 8D • </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7dd3fc] to-[#8b5cf6]">
                <span ref={typedEl} />
              </span>
            </h1>

            <p className="mt-6 text-gray-300 max-w-xl">
              Upload a track or paste a YouTube link to convert it into an
              immersive 3D / 8D / 16D experience — right in your browser. No
              login. Fast processing. MP3 export included.
            </p>

            {/* small features row */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm font-semibold">Stem Separation</div>
                <div className="text-xs text-gray-400">
                  Vocals / Instruments
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm font-semibold">Natural Rotation</div>
                <div className="text-xs text-gray-400">Behavioral engine</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm font-semibold">Export</div>
                <div className="text-xs text-gray-400">MP3 / WAV</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Upload box */}
          <div className="md:col-span-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              {/* Mode toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => setMode("upload")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      mode === "upload"
                        ? "bg-gradient-to-r from-[#7dd3fc] to-[#8b5cf6] text-black"
                        : "text-gray-300"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setMode("url")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      mode === "url"
                        ? "bg-gradient-to-r from-[#7dd3fc] to-[#8b5cf6] text-black"
                        : "text-gray-300"
                    }`}
                  >
                    URL
                  </button>
                </div>

                {/* Preset selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-400">Preset</label>
                  <select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value)}
                    className="bg-[#0d1117] border border-white/10 text-sm rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#4f9cff] "
                  >
                    {PRESETS.map((p) => (
                      <option
                        key={p}
                        className="bg-[#0d1117] text-white"
                        value={p}
                      >
                        {p.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Area */}
              <div>
                {mode === "upload" ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center bg-white/2 hover:border-white/20 transition"
                  >
                    <div className="mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-12 w-12 text-[#7dd3fc]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 10V7a5 5 0 1110 0v3"
                        />
                      </svg>
                    </div>

                    {!file ? (
                      <>
                        <div className="text-lg font-semibold">
                          Drop your song here
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                          MP3 / WAV / AAC
                        </div>

                        <label className="mt-4 inline-block">
                          <input
                            type="file"
                            onChange={onFileChange}
                            accept="audio/*"
                            className="hidden"
                          />
                          <div className="mt-3 inline-flex items-center px-4 py-2 bg-[#7dd3fc] text-black rounded-full cursor-pointer hover:opacity-90">
                            Choose file
                          </div>
                        </label>
                      </>
                    ) : (
                      <div className="text-left">
                        <div className="font-medium">{fileName}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          File ready to upload.
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => {
                              setFile(null);
                              setFileName("");
                            }}
                            className="px-3 py-1 bg-white/5 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-sm text-gray-400">
                      Paste YouTube or direct URL
                    </label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full rounded-lg px-4 py-3 bg-transparent border border-white/10 outline-none placeholder-gray-500"
                    />
                    <div className="text-xs text-gray-400">
                      We will fetch & process the audio from the URL. URL will
                      be sent to server.
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 text-sm text-red-400">{error}</div>
              )}

              {/* Convert button + Progress */}
              <div className="mt-6 flex flex-col space-y-3">
                {/* <button
                  onClick={handleConvert}
                  // onClick={testFun}
                  disabled={uploading}
                  className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#7dd3fc] to-[#8b5cf6] text-black font-semibold hover:opacity-95 disabled:opacity-50  `}
                >
                  {uploading ? `Uploading... ${progress}%` : "Convert Now"}
                </button> */}

                <button
                  onClick={handleConvert}
                  disabled={uploading || processing}
                  className={`w-full px-4 py-3 rounded-xl 
                         bg-gradient-to-r from-[#7dd3fc] to-[#8b5cf6]
                         text-black font-semibold flex items-center justify-center gap-3 
                         disabled:opacity-50 transition-all duration-300`}
                >
                  {uploading ? (
                    `Uploading... ${progress}%`
                  ) : processing ? (
                    <div className="flex items-center justify-center w-full gap-3">
                      <Loader />
                      <span className="text-white" >Processing...</span>
                    </div>
                  ) : (
                    "Convert Now"
                  )}
                </button>

                {/* progress bar */}
                {uploading && (
                  <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-[#7dd3fc] to-[#8b5cf6]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Small footer */}
              <div className="mt-4 text-xs text-gray-500">
                By uploading, you agree to our processing terms. No account
                required.
              </div>
            </div>
          </div>
        </div>
        {/* Output Box */}
        {result && (
          <>
            {/* AudioBox */}

            {visibleOutput && (
              <div className="fixed bottom-0 left-0 w-full bg-[#0d1117] border-t border-white/10 p-4 shadow-xl z-50 animate-slide-up  ">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    Processed Audio
                  </h3>

                  <button
                    onClick={() => setVisibleOutput(false)}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    <KeyboardArrowDownIcon />
                  </button>
                </div>

                <div className="output-play-box flex items-center justify-between">
                  {/* Audio Player */}
                  <audio
                    controls
                    src={result.downloadUrl}
                    className="w-1/2 min-w-3xs mb-4 rounded-lg"
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Download */}
                    <a
                      href={result.downloadUrl}
                      download
                      className="px-4 py-2 bg-[#7dd3fc] text-black rounded-lg font-semibold hover:bg-[#6ac8ea] cursor-pointer"
                    >
                      Download
                    </a>

                    {/* Share */}
                    <button
                      onClick={async () => {
                        if (navigator.share) {
                          await navigator.share({
                            title: "Processed Audio",
                            url: result.downloadUrl,
                          });
                        } else {
                          navigator.clipboard.writeText(result.downloadUrl);
                          alert("Link copied!");
                        }
                      }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 cursor-pointer"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Floatting Button  */}
            {!visibleOutput && (
              <button
                onClick={() => setVisibleOutput(true)}
                className=" flex items-center gap-2 fixed bottom-5 right-5 cursor-pointer bg-[#121e30] text-white px-4 py-2 rounded-xl shadow-lg font-semibold z-50 hover:bg-[#0d1622] transition-all duration-300 active:scale-95"
              >
                <Headphones size={32} className="text-[#ea1fea]" />
                <span>Play Audio</span>
              </button>
            )}
          </>
        )}
      </div>

      <AlertMessage open={alert.open} type={alert.type} message={alert.message}  onClose={()=> setAlert({...alert,open:false})} />
    </section>
  );
}
