import './App.css';
import mypic from './assets/mypic.jpg';
import Ai from './assets/Ai-img.jpeg';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [fullResponse, setFullResponse] = useState('');

  const typingIntervalRef = useRef(null);
  const utteranceRef = useRef(null);

  const typeTextEffect = (text) => {
    let index = -1;
    setResponse('');
    clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setResponse(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
      }
    }, 50);
  };

  const stopTyping = () => {
    clearInterval(typingIntervalRef.current);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  const clearAll = () => {
    stopTyping();
    stopSpeaking();
    setQuestion('');
    setResponse('');
    setFullResponse('');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    stopTyping();
    stopSpeaking();
    setResponse('');
    setFullResponse('');

    try {
      const res = await axios.post('https://my-gemini-eta-nine.vercel.app/getResponse', {
        question: question
      });

      console.log("Backend Response:", res.data);

      let text = res?.data?.response;

      if (!text || typeof text !== 'string') {
        setResponse("⚠️ Invalid or empty response.");
        return;
      }

      setFullResponse(text);
      typeTextEffect(text);

    } catch (err) {
      console.error("Error from Axios:", err);
      setResponse("❌ Error occurred while fetching response.");
    }
  };

  const speakHandler = () => {
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(fullResponse);
    utteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const isHindi = /[\u0900-\u097F]/.test(fullResponse);
    const selectedVoice = voices.find(voice =>
      isHindi ? voice.lang.includes('hi') : voice.lang.includes('en')
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  return (
    <div className="App">
      <div className="box">
        <div className="profile-pic">
          <img className="pic" alt="profile pic" src={mypic} />
        </div>
        <p className="label">Write any Query</p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <button onClick={submitHandler}>Send</button>
        <button onClick={clearAll}>Clear</button>
      </div>

      <div className="box">
        <div className="profile-pic">
          <img className="pic" alt="profile pic" src={Ai} />
        </div>
        <p className="label">Get Answer</p>
        <textarea value={response} readOnly></textarea>
        <button onClick={speakHandler}>Speak</button>
        <button onClick={stopSpeaking}>Stop Voice</button>
        <button onClick={stopTyping}>Stop Typing</button>
      </div>
    </div>
  );
}

export default App;
