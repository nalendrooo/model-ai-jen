import OpenAI from "openai"
import dotenv from "dotenv"
import fs from "fs"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
const port = 3826

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.get ("/analysis", async (req, res) => {
    const token = req.headers.authorization
    const type = req.query.type
    const endpoint = process.env.SANDBOX_SOLUTES_SISWA
    console.log(type)
    const api = type ? endpoint + "?type=" + type : endpoint + "?type=subject"

    if(!token) {
        console.log("Token Not Found")
        res.status(400).json({
            status: "error",
            message: "token not found"
        })
    } else {
        // console.log("Token Found", token)
        const data = await getData(token, api);
        console.log("Data:", data.data);

        const prompt = `Berikan analisis dari data berikut ${JSON.stringify(data)}
        Catatan :
        * Berikan output berupa JSON saja
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
                "highest": [
                        {
                            "name": string, // Nama Ujian
                            "score": number // Nilai tertinggi
                        }
                ] // Nama Ujian dan Nilai tertinggi dari ujian, tampilkan salah satu aja jika ada yang sama
                "lowest": [
                    {
                        "name": string, // Nama Ujian
                        "score": number // Nilai terendah
                    }
                ] // Nama Ujian dan Nilai terendah dari ujian, tampilkan salah satu aja jika ada yang sama
            }`
        
        const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        // model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
            temperature: 0.5, //For gpt-4o-mini
            // temperature: 0.7, //For  gpt-3.5-turbo
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
        const highest = parsedResponse?.highest
        const lowest = parsedResponse?.lowest
        console.log("Clean Data:", data);
        res.status(200).json({
            status: "success",
            message: "successfully to analyse",
            data: data,
            summary: summary,
            highest: highest,
            lowest: lowest
            })
        }
    }
        
})

function getData(token, api) {

    console.log("Endpoint nya : ", api)
    console.log("Ini token nya : ", token)

    return fetch(api, {
        method: "GET",
        headers: {
            "Authorization": `${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})