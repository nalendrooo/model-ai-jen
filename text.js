import OpenAI from "openai"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

async function main() {
    const transcript = await openai.audio.transcriptions.create({
        file: fs.createReadStream("videos/test.mp4"),
        model: "whisper-1"
    })

    console.log(transcript.text)
}

main()