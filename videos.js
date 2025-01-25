import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileState, GoogleAICacheManager, GoogleAIFileManager } from '@google/generative-ai/server';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Mendapatkan direktori saat ini dalam modul ES
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fungsi helper untuk mengunggah video ke cache.
async function uploadMp4Video(filePath, displayName) {
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);
  const fileResult = await fileManager.uploadFile(filePath, {
    displayName,
    mimeType: 'video/mp4',
  });

  const { name, uri } = fileResult.file;

  // Mengecek status file tiap 2 detik hingga selesai diproses.
  let file = await fileManager.getFile(name);
  // while (file.state === FileState.PROCESSING) {
  //   console.log('Menunggu video selesai diproses.');
  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  //   file = await fileManager.getFile(name);
  // }
  while (file.state === FileState.PROCESSING || file.state !== FileState.ACTIVE) {
    console.log('Menunggu video selesai diproses.');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    file = await fileManager.getFile(name);
  }
  

  console.log(`Video selesai diproses: ${uri}`);
  return fileResult;
}

// Mengambil video dari URL dan mengubahnya menjadi Buffer
const response = await fetch(process.env.URL_VIDEO);
const arrayBuffer = await response.arrayBuffer();
const fileBuffer = Buffer.from(arrayBuffer);

// Menyimpan Buffer sebagai file sementara
const tempFilePath = path.join(__dirname, 'temp-video.mp4');
fs.writeFileSync(tempFilePath, fileBuffer);

// Mengunggah video.
const fileResult = await uploadMp4Video(tempFilePath, 'temp-video');
console.log('File berhasil diunggah:', fileResult);

// Menghapus file sementara setelah diunggah
fs.unlinkSync(tempFilePath);

// Membuat GoogleAICacheManager menggunakan API key.
const cacheManager = new GoogleAICacheManager(process.env.API_KEY);

// Membuat cache dengan TTL 5 menit.
const displayName = 'temp-video';
const model = 'models/gemini-1.5-flash-001'
const systemInstruction =
  'Anda adalah ahli analisis video' 
let ttlSeconds = 300

try {
  const cache = await cacheManager.create({
    model,
    displayName,
    systemInstruction,
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              mimeType: fileResult.file.mimeType,
              fileUri: fileResult.file.uri,
            },
          },
        ],
      },
    ],
    ttlSeconds,
  }
);
  console.log('Cache berhasil dibuat:', cache);

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const genModel = genAI.getGenerativeModelFromCachedContent(cache);

  // Query ke model.
  const result = await genModel.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              'Buatlah transkrip dari video tersebut!'
          },
        ],
      },
    ],
  });

  console.log('Response berhasil dibuat:', result.response.text());
} catch (error) {
  console.error('Error saat membuat konten:', error);
}