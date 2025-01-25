import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  return (
    <>
      <div className="title">
        <h1>Gemini Essay Question</h1>
      </div>
      <div className="question">
        <p> Jelaskan bagaimana perkembangan teknologi informasi dan komunikasi telah mempengaruhi pola 
          interaksi sosial di masyarakat modern, baik dari segi positif maupun negatif!
        </p>
      </div>
      <div className="answer">
        <textarea name="answer-text" id="answer-text" rows="10" cols="75"></textarea>
      </div>
      <div className="submit-btn">
        <button>Submit</button>
      </div>
    </>
  );
}

export default App