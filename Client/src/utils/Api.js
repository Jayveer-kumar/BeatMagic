// const API_URL = 'https://beatmagic.onrender.com' || 'http://localhost:8080';
const API_URL = 'https://beatmagic.onrender.com';
console.log("API URL : ");
console.log(API_URL);
export function uploadAudio({ file, url, preset = "8d" , systemAddress, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Choose Backend Endpoint

    const endpoint = file? "/api/audio/process-file" : "/api/audio/process-url"; 

    const form = new FormData();
    if (file) form.append("audio", file);
    if (url) form.append("url", url);
    form.append("effect", preset);
    form.append("systemAddress",systemAddress)

    xhr.open("POST", API_URL+endpoint, true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable && typeof onProgress === "function") {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch (err) {
          resolve({ success: true, message: "Uploaded (non-json response)", raw: xhr.responseText });
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error during upload"));
    };

    xhr.send(form);
  });
}
