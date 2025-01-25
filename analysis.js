import OpenAI from "openai"
import dotenv from "dotenv"
import fs from "fs"
import express from "express"
import bodyParser from "body-parser"

const app = express()
app.use(express.json())
app.use(bodyParser.json())
const port = 3826

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post ("/analysis", async (req, res) => {
    const { data } = req.body;

    if(!data) {
        console.log("Data Not Found");
        res.status(400).json({
            status: "error",
            message: "data not found"
        })
    } else {

    console.log("Data:", data);
    const prompt = `Berikan analisis dari data berikut ${JSON.stringify(data)}
    Catatan :
    * Berikan output berupa JSON saja
    * Jangan lakukan analisa jika tidak ada data
    **Format Output:**
    * JSON dengan struktur:
        data: [
            {
                "name": string, // Nama Ujian
                "average_score": number, // Rata-rata nilai dari data yang didapat
                "total_questions": number, // Total Soal dari data yang didapat
                "analysis": string // Analisa dari data
            }
        ],
        {
            "summary": string // Rangkuman Lengap yang berisi penjelasan lengkap dari analisa setiap jenis ujian dan jangan ada kata "di atas"
        }`

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 3000,
        top_p: 1,
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
    
        const data = parsedResponse?.data
        const summary = parsedResponse?.summary
        console.log("Clean Data:", data);
        res.json({
            status: "success",
            message: "successfully to analyse",
            data: data,
            summary: summary
        })
    }
    }

    // console.log("Response API:", response.choices[0].message.content);   
})

// async function main() {
//     try {
//         const data = await getData();
//         // console.log("Data:", data);
//         console.log("Menunggu Response...");

//         if (!data) {
//             console.error("Data not found");
//             return;
//         }

//         const prompt = `Berikan analisis dari data berikut ${JSON.stringify(data)}
//         **Format Output:**
//         * JSON dengan struktur:
//             data: [
//                 {
//                     "name": string, // Nama Ujian
//                     "average_score": number, // Rata-rata nilai dari data yang didapat
//                     "total_questions": number, // Total Soal dari data yang didapat
//                     "analysis": string // Analisa dari data
//                 }
//             ],
//             {
//                 "summary": string // Rangkuman Lengap yang berisi penjelasan lengkap dari analisa setiap jenis ujian dan jangan ada kata "di atas"
//             }`

//         const response = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             messages: [
//                 { role: "assistant", content: "Kamu adalah ahli analisis nilai dan memberikan rekomendasi terhadapat hasil analisis dari data yang diberikan, standar nilai yang diharapkan adalah 60" },
//                 { role: "user", content: prompt},
//             ]  
//         })

//         console.log(response.choices[0].message.content);
//     } catch (error) {
//         console.error("Error:", error.message);
//         return main()
//     } 
// }

// function getData() {
//     const endpoint = process.env.SOLUTES_SISWA;
//     const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjI1NjIsImVtYWlsIjoicGludGFuaW5nZHlhaGRpYW5AZ21haWwuY29tIiwicm9sZSI6InNpc3dhIiwicm9sZV9pZCI6MSwiZnVsbF9uYW1lIjoic2RpYWxtdXN0NTAxIiwic2Nob29sIjp7ImlkIjoxLCJuYW1lIjoiU01QTiBFUkxBTkdHQSAwMSIsInBlcmlvZGVfaWQiOjF9LCJpYXQiOjE3MzY0NzQ2NTMsImV4cCI6MTgzNjQ3NDY1Mn0.dexjebcsZkU536aqOWQxKGMKvCFgeyHIGWxm-gLCCqw`;

//     return fetch(endpoint, {
//         method: "GET",
//         headers: {
//             "Authorization": `Bearer ${token}`,
//         },
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         });
// }

// main();

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})