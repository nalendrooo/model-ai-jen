import OpenAI from 'openai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mendapatkan direktori saat ini dalam modul ES
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fungsi untuk mengunduh file audio dari URL
async function downloadAudio(url, outputFilePath) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputFilePath, fileBuffer);
  console.log(`Audio berhasil diunduh: ${outputFilePath}`);
}

// Path untuk menyimpan file audio sementara
const tempAudioPath = path.join(__dirname, 'temp-audio.mp3');

// Mengunduh audio dan menyimpannya sebagai file sementara
await downloadAudio(process.env.URL_AUDIO, tempAudioPath);

// Fungsi untuk transkripsi audio menggunakan OpenAI API
async function transcribeAudio(filePath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
  });

  return transcription.text;
}

// Transkripsi audio dan menampilkan hasilnya
try {
  const transcript = await transcribeAudio(tempAudioPath);
  console.log('Transkrip berhasil dibuat:', transcript);
} catch (error) {
  console.error('Error saat melakukan transkripsi:', error);
} finally {
  // Hapus file audio sementara setelah transkripsi selesai
  fs.unlinkSync(tempAudioPath);
}