import OpenAI from "openai";

import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Jelaskan gambar tersebut dengan indikator klasifikasi hewan" },
            {
              type: "image_url",
              image_url: {
                "url": "https://th.bing.com/th/id/R.d29abd289b0488677521ef5908cb7c1e?rik=%2fsHdF24LANaH4Q&riu=http%3a%2f%2fbugwoodcloud.org%2fimages%2f1536x1024%2f4911089.jpg&ehk=LE3%2b5La57Y%2b3S8ZURFvo%2fiUB1oAlqGFMe2bdrs5Unqc%3d&risl=&pid=ImgRaw&r=0",
              },
            },
            {
              type: "image_url",
              image_url: {
                "url": "https://4.bp.blogspot.com/-V8RD_wzCRQs/V5Rlbo80txI/AAAAAAAACGo/rliY7NowA74d1rhKR3QWQ0aldBscP_LJQCLcB/s1600/Gambar-harimau-9.JPG",
              },
            }
          ],
        },
      ],
    });

  console.log(response.choices[0]);
}
main();