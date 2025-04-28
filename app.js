import express from 'express'
const app = express()
const port = 3030
import bodyParser from 'body-parser'
import { GoogleGenerativeAI } from "@google/generative-ai"
// const { SchemaType } = require("@google/generative-ai");
import { SchemaType } from "@google/generative-ai"
import OpenAI from 'openai';

import dotenv from 'dotenv'
dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use (bodyParser.json())

// async function generateGeminiContent(question, answer, myAnswer) {
//   const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  
//   // Buat prompt berdasarkan data dari request body
//   const prompt = `Berikan nilai 1-100 untuk perbandingan JawabanSoal yang sudah dikethui kebenaran nya sesuai soal yang diberikan dengan JawabanSaya dari Soal : ${question}\nJawabanSoal: ${answer}\nJawabanSaya: ${myAnswer}\n dengan JSON schema ini: nilai = {'score': string} Return: Array<score>.`;

//   // Panggil model generatif API Gemini
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   try {
//     const result = await model.generateContent(prompt);
//     return result.response.text();  // Mengembalikan hasil dari API Gemini
//   } catch (error) {
//     console.error("Error hitting Gemini API:", error);
//     return null; // Mengembalikan null jika terjadi error
//   }
// }

// app.post("/nilai", async (req, res) => {
//   const { question, answer, myAnswer } = req.body;
  
//   const prompt = `Evaluasi antara JawabanSaya dengan JawabanSoal dari Soal: ${question}. 
// Berikan nilai numerik antara 1-100 yang merepresentasikan tingkat kebenaran JawabanSaya terhadap JawabanSoal. 

// **Detail Soal:**
// * Soal: ${question}
// * Jawaban Soal: ${answer}
// * Jawaban Saya: ${myAnswer}

// **Format Output:**
// * JSON dengan struktur:
//   {
//     "score": number, // Nilai kesamaan (1-100)
//     "similarityPercentage": number, // Persentase kesamaan (opsional)
//     "errorAnalysis": string // Analisis kesalahan (opsional)
//   }
// `
// console.log("Prompt:", prompt);
// const geminiResponse = await generateGeminiContent(prompt);

// if (geminiResponse) {
//   console.log("Gemini Response:", geminiResponse);
//   const cleanedResponse = geminiResponse.replace(/```json|```|\n/g, '').trim();
//   console.log("Cleaned Response:", cleanedResponse);

//   let parsedResponse = null;

//   try {
//     parsedResponse = JSON.parse(cleanedResponse);
//     console.log("Parsed JSON Response:", parsedResponse);
//   } catch (error) {
//     console.error("Error parsing Gemini response:", error)
//     parsedResponse = null
//   }

// const score = parsedResponse?.score ?? null;

// console.log("Score:", score);

//     res.json({
//       question,
//       answer,   
//       myAnswer,   
//       score          
//     });

//     console.log("Response:", geminiResponse);
//   } else {
//     res.status(500).json({ error: "Failed to process Gemini API request" });
//   }
// });

app.post("/nilai", async (req, res) => {
  const { question, answer, myAnswer } = req.body;
  
  const prompt = `Evaluasi antara JawabanSaya dengan JawabanSoal dari Soal: ${question}.
Jika ada tag html pada Soal dan JawabanSoal, maka cukup ambil isi nya aja.
Berikan nilai numerik antara 1-100 yang merepresentasikan tingkat kemiripan JawabanSaya terhadap JawabanSoal.
Tidak masalah jika ada kata yang berbeda namun tetap memiliki makna yang sama sebagai satu kalimat, maka dapat diberi nilai 100.
Identifikasi bahasa apa yang digunakan Jawaban Soal.

**Detail Soal:**
* Soal: ${question}
* Jawaban Soal: ${answer}
* Jawaban Saya: ${myAnswer}

**Format Output:**
* JSON dengan struktur:
  {
    "score": number, // Nilai kesamaan (1-100)
    "similarityPercentage": number, // Persentase kesamaan (opsional)
    "errorAnalysis": string // Analisis kesalahan (opsional)
    "languages": string // Bahasa Jawaban Soal
  }
`
console.log("Prompt:", prompt);
const response = await openai.chat.completions.create({
        // model: "gpt-4o-mini",
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
            // temperature: 0.5, //For gpt-4o-mini
            temperature: 0.7, //For  gpt-3.5-turbo
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        if (response.choices[0].message.content) {
          const cleanedResponse = response.choices[0].message.content.replace(/```json|```|\n/g, '').trim();
          console.log("Cleaned Response:", cleanedResponse);
  
          let parsedResponse = null;
  
          try {
              parsedResponse = JSON.parse(cleanedResponse);
              console.log("Parsed Response:", parsedResponse);
          } catch (error) {
              console.error("Error parsing JSON:", error);
              parsedResponse = null;
          }
          
          const data = parsedResponse?.score
          const summary = parsedResponse?.errorAnalysis
          const languages = parsedResponse?.languages
          console.log("Clean Data:", data);
          res.status(200).json({
              status: "success",
              message: "successfully to analyse",
              score: data,
              summary: summary,
              languages: languages
          })
      }
})

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})