import React from 'react';

function Question({ text, onAnswer }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl mb-4">{text}</h2>
      <div className="flex justify-center space-x-4">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => onAnswer(true)}
        >
          כן
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => onAnswer(false)}
        >
          לא
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => onAnswer(null)}
        >
          לא יודע
        </button>
      </div>
    </div>
  );
}

export default Question;
