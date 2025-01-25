import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import path from "path";

const app = express();
const port = 3838;
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/transcript", upload.single("video"), async (req, res) => {
  const video = req.file;

  if (!video) {
    console.log("Video Not Found");
    return res.status(400).send("Video Not Found");
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(video.path),
      model: "whisper-1",
    });

    console.log("Transcription Success");
    console.log("Text: ", transcription.text);
    res.json({
      transcription: transcription.text
    })
    // res.status(200).send(`Transcription Success: ${transcription.text}`);

    // Cleanup: delete the uploaded file
    fs.unlink(video.path, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });
  } catch (error) {
    console.error("Error transcripting video:", error);
    res.status(500).send(`Error transcripting video: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});