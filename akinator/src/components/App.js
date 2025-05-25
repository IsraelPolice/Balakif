import React, { useState, useEffect } from 'react';
import Question from './components/Question';
import Character from './components/Character';
import './styles.css';

function App() {
  const [question, setQuestion] = useState(null);
  const [guess, setGuess] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    const response = await fetch('http://localhost:5000/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const data = await response.json();
    if (data.guess) {
      setGuess(data.guess);
      setQuestion(null);
    } else {
      setQuestion(data.question);
    }
  };

  const handleAnswer = async (answer) => {
    setAnswers([...answers, { questionId: question.id, answer }]);
    await fetchQuestion();
  };

  const resetGame = () => {
    setAnswers([]);
    setGuess(null);
    fetchQuestion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-8">מי החבר?</h1>
      <Character />
      {question && (
        <Question
          text={question.text}
          onAnswer={handleAnswer}
        />
      )}
      {guess && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">אני חושב שזה {guess}!</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={resetGame}
          >
            שחק שוב
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
