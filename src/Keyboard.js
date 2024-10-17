import React from 'react';

function Keyboard({ onGuess }) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div>
      {letters.map(letter => (
        <button key={letter} onClick={() => onGuess(letter)}>
          {letter}
        </button>
      ))}
    </div>
  );
}

export default Keyboard;
