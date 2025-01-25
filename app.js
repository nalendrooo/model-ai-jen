import express from 'express'
const app = express()
const port = 3030
import bodyParser from 'body-parser'
import { GoogleGenerativeAI } from "@google/generative-ai"
// const { SchemaType } = require("@google/generative-ai");
import { SchemaType } from "@google/generative-ai"

import dotenv from 'dotenv'
dotenv.config()

app.use (bodyParser.json())

async function generateGeminiContent(question, answer, myAnswer) {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  
  // Buat prompt berdasarkan data dari request body
  const prompt = `Berikan nilai 1-100 untuk perbandingan JawabanSoal yang sudah dikethui kebenaran nya sesuai soal yang diberikan dengan JawabanSaya dari Soal : ${question}\nJawabanSoal: ${answer}\nJawabanSaya: ${myAnswer}\n dengan JSON schema ini: nilai = {'score': string} Return: Array<score>.`;

  // Panggil model generatif API Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();  // Mengembalikan hasil dari API Gemini
  } catch (error) {
    console.error("Error hitting Gemini API:", error);
    return null; // Mengembalikan null jika terjadi error
  }
}

app.post("/nilai", async (req, res) => {
  const { question, answer, myAnswer } = req.body;
  
  const prompt = `Evaluasi antara JawabanSaya dengan JawabanSoal dari Soal: ${question}. 
Berikan nilai numerik antara 1-100 yang merepresentasikan tingkat kebenaran JawabanSaya terhadap JawabanSoal. 

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
  }
`
console.log("Prompt:", prompt);
const geminiResponse = await generateGeminiContent(prompt);

if (geminiResponse) {
  const cleanedResponse = geminiResponse.replace(/```json|```|\n/g, '').trim();
  console.log("Cleaned Response:", cleanedResponse);

  let parsedResponse = null;

  try {
    parsedResponse = JSON.parse(cleanedResponse);
    console.log("Parsed JSON Response:", parsedResponse);
  } catch (error) {
    console.error("Error parsing Gemini response:", error)
    parsedResponse = null
  }

const score = parsedResponse?.score ?? null;

console.log("Score:", score);

    res.json({
      question,
      answer,   
      myAnswer,   
      score          
    });

    console.log("Response:", geminiResponse);
  } else {
    res.status(500).json({ error: "Failed to process Gemini API request" });
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})