import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate-text', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        console.log(userPrompt)

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userPrompt }
            ],
        });

        res.json({
            status: 'success',
            data: completion.choices[0].message.content.replace(/\n/g, ' ').replace(/\*/g, '').replace(/\#/g, '')
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
});

// Mulai server di port 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});