import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.generate({
        voice: "Adam",
        model_id: "eleven_turbo_v2_5",
        text,
      });
      const fileName = `${uuid()}.mp3`;
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);
      fileStream.on("finish", () => resolve(fileName)); // Resolve with the fileName
      fileStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Example usage
createAudioFileFromText("Halo, selamat sore sayangku. Nanti malam kita dinner yaa")
  .then((fileName) => {
    console.log(`Audio file created: ${fileName}`);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
  });