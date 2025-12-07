const youtubeService = require("../services/youtubeService");
const pythonService = require("../services/pythonService");

exports.processUploaded = async (req, res) => {
  console.log("Processing uploaded file : ");
  const effect = req.body.effect;
  const inputPath = req.file.path;
  if(!inputPath){
    return res.status(400).json({ success:false, error: "No file uploaded" });
  }
  if(!effect){
    return res.status(400).json({ success:false, error: "No effect specified" });
  }

  try {
    const output = await pythonService.runPython(inputPath, effect);
    return res.json({ success: true, result: output });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Processing failed Please try later!" });
  }
};



exports.processFromURL = async (req, res) => {
  console.log("Processing from URL : ");
  
  const { effect, url } = req.body;
  console.log("Effect : ", effect);
  console.log("URL : ", url);
  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }
  if (!effect) {
    return res.status(400).json({ error: "No effect specified" });
  }
  try {
    const downloadedPath = await youtubeService.downloadFromYoutube(url);
    console.log("Downloaded File Path : ",downloadedPath);
    const output = await pythonService.runPython(downloadedPath, effect);

    return res.json({ success: true, result: output });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "YouTube download failed" });
  }
};
