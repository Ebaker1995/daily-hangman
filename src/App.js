import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import Hangman from './Hangman';
import Keyboard from './Keyboard';
import Word from './Word';

function App() {
  const [word, setWord] = useState("REACT");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [lives, setLives] = useState(6);

  // Handle a letter being clicked on the keyboard
  const handleLetterClick = (letter) => {
    // If the letter has already been guessed, do nothing
    if (guessedLetters.includes(letter)) return;

    // Add the guessed letter to the guessed letters array
    setGuessedLetters([...guessedLetters, letter]);

    // Check if the guessed letter is in the word
    if (!word.includes(letter)) {
      // If the guessed letter is incorrect, decrement lives
      setLives(lives - 1);
    }
  };

  return (
    <div className="Apps">
      <h1>Daily Hangman</h1>
      <Hangman
        word={word}
        guessedLetters={guessedLetters}
        lives={lives}
        onLetterClick={handleLetterClick}
      />
    </div>
  );
}

export default App;
