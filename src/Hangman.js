import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';


// Function to return the hangman drawing based on incorrect guesses (lives left)
const getHangmanDrawing = (lives) => {
  const stages = [
    `
       -----
       |   |
       O   |
      /|\\  |
      / \\  |
    ---------
    `,
    `
       -----
       |   |
       O   |
      /|\\  |
      /    |
    ---------
    `,
    `
       -----
       |   |
       O   |
      /|\\  |
           |
    ---------
    `,
    `
       -----
       |   |
       O   |
      /|   |
           |
    ---------
    `,
    `
       -----
       |   |
       O   |
       |   |
           |
    ---------
    `,
    `
       -----
       |   |
       O   |
           |
           |
    ---------
    `,
    `
       -----
       |   |
           |
           |
           |
    ---------
    `,
  ];

  return stages[6 - lives]; // Display the figure based on remaining lives
};

// Function to display hearts for lives
const renderHearts = (lives) => {
    const totalLives = 6; // Total number of lives
    const hearts = [];
    
    for (let i = 0; i < totalLives; i++) {
      // If the current heart index is less than lives, show a full heart, else show an empty heart
      hearts.push(i < lives ? '❤️' : '🖤');
    }
    
    return hearts.join(' ');
  };

  // Function to save stats to localStorage
const saveStatsToLocalStorage = (stats) => {
  localStorage.setItem('hangmanStats', JSON.stringify(stats));
};
// Function to get stats from localStorage
const getStatsFromLocalStorage = () => {
  const savedStats = localStorage.getItem('hangmanStats');
  return savedStats ? JSON.parse(savedStats) : { played: 0, wins: 0, losses: 0 };
};


function Hangman() {
  const [word, setWord] = useState(getDailyWord());
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [lives, setLives] = useState(6);
  const [gameOver, setGameOver] = useState(false); // Track if the game is over (loss)
  const [gameWon, setGameWon] = useState(false); // Track if the game is won
  const [canPlay, setCanPlay] = useState(true);
  const [playCount, setPlayCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [stats, setStats] = useState(getStatsFromLocalStorage()); // Load saved stats from localStorage

  // Check if the game has already been completed today
  useEffect(() => {
    const completedDate = localStorage.getItem('gameCompletedDate');
    const today = new Date().toLocaleDateString();

    if (completedDate === today) {
      setCanPlay(false); // Disable gameplay if already completed today
    } else {
      // Update the play count for new day
      const storedPlayCount = localStorage.getItem('playCount') || 0;
      setPlayCount(parseInt(storedPlayCount));
    }
  }, []);;

  // Function to handle letter click
  const onLetterClick = (letter) => {
    if (gameOver || !canPlay) return; // Don't allow more guesses if the game is over or already completed

    if (guessedLetters.includes(letter)) return; // Don't let the same letter be guessed again

    setGuessedLetters((prev) => [...prev, letter]);

    if (!word.includes(letter)) {
      setLives((prev) => prev - 1);
    }
  };

  // Check if the game is over (either win or loss)
  useEffect(() => {
    if (lives === 0) { //LOST GAME
      const guessedWord = word.split('').map((letter) => (guessedLetters.includes(letter) ? letter : '_')).join(' ')
      setGameOver(true);
      Cookies.set('lives', lives,);
      Cookies.set("lost", true)
      Cookies.set('guessedLetters', guessedLetters)
      Cookies.set('guessedWord', guessedWord)
      setGameWon(false);
      localStorage.setItem('gameCompletedDate', new Date().toLocaleDateString()); // Mark game as completed
      setStats((prevStats) => {
        const updatedStats = { ...prevStats, played: prevStats.played + 1, losses: prevStats.losses + 1 };
        saveStatsToLocalStorage(updatedStats); // Save updated stats to localStorage
        return updatedStats;
      });

      setCanPlay(false);
    } else if (word.split('').every((letter) => guessedLetters.includes(letter))) { // WON GAME
      const guessedWord = word.split('').map((letter) => (guessedLetters.includes(letter) ? letter : '_')).join(' ')
      Cookies.set('lives', lives,);
      Cookies.set("won", true)
      Cookies.set('guessedLetters', guessedLetters)
      Cookies.set('guessedWord', guessedWord)
      setGameOver(true);
      setGameWon(true);
      localStorage.setItem('gameCompletedDate', new Date().toLocaleDateString()); // Mark game as completed
      setStats((prevStats) => {
        const updatedStats = { ...prevStats, played: prevStats.played + 1, wins: prevStats.wins + 1 };
        saveStatsToLocalStorage(updatedStats); // Save updated stats to localStorage
        return updatedStats;});
      setCanPlay(false);
    }
  }, [guessedLetters, lives, word]);

  // Recalculate the word at midnight every day
  useEffect(() => {
    const updateWordAtMidnight = () => {
      setWord(getDailyWord());
      setGuessedLetters([]); // Reset guessed letters for the new word
      setLives(6); // Reset lives
      setGameOver(false); // Reset gameOver status
      setGameWon(false); // Reset game won status
      Cookies.remove('lives');
      Cookies.remove('lost');
      Cookies.remove('won');

      Cookies.remove('guessedLetters');
      Cookies.remove('guessedWord')
    };

    // Set an interval to update the word at midnight
    const now = new Date();
    const timeToMidnight = new Date(now.setHours(24, 0, 0, 0)).getTime() - Date.now();
    
    const timer = setTimeout(() => {
      updateWordAtMidnight();
      setInterval(updateWordAtMidnight, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeToMidnight);

    return () => clearTimeout(timer); // Clear timeout when component unmounts
  }, []);

  const displayWord = word.split('').map((letter) =>
    guessedLetters.includes(letter) ? letter : '_'
  ).join(' ');

  // Function to handle sharing the result
  const shareResult = () => {
    const resultText = gameWon
      ? `You won! It took ${guessedLetters.length} guesses! 🎉\n\nPlay here: https://daily-hangman.netlify.app/`
      : `You lost! Better luck next time! 😢\n\nPlay here: https://daily-hangman.netlify.app/`;

    // Copy to clipboard
    navigator.clipboard.writeText(resultText).then(() => {
      alert('Result copied to clipboard!');
    });

    
    
  };

  

  // Fetch and return the play, win, and loss statistics
  const getStatistics = () => {
    
    
    return (
      
      <div className="stats">
        <h3>Statistics</h3>
        <p>Days Played: {stats.played}</p>
        <p>Wins: {stats.wins}</p>
        <p>Losses: {stats.losses}</p>
        
        
      </div>
    );
  };

  if (canPlay) { //Normal condition
    
    return (
      <div className="App">
        
        <pre>{getHangmanDrawing(lives)}</pre>
        <p>Word: {word.split('').map((letter) => (guessedLetters.includes(letter) ? letter : '_')).join(' ')}</p>
        <p>Lives: {renderHearts(lives)}</p>
        <p>Guessed Letters: {guessedLetters.join(', ')}</p>

        {/* Keyboard */}
        <div className="keyboard">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={guessedLetters.includes(letter) || gameOver || !canPlay}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Game Over / Win Screen */}
        {gameOver && (
          <div className="result">
            {gameWon ? (
              <h2>Congratulations, You Won!</h2>
            ) : (
              <h2>Game Over! You Lost</h2>
            )}
            <p>The word was: {word}</p>

            <button className="share-button" onClick={shareResult}>Share Result</button>
            
            
          </div>
        )}

        {/* If game is already completed today */}
        {!canPlay && <p>You've already played today!</p>}

        {/* <button className="share-button" onClick={shareResult}>Share Result</button> */}
        
        
        {/* Display statistics */}
        {getStatistics()}
        
        
      </div>
    );
  }

  if (!canPlay) { //Game has already been beat today

    const cookiesLives = Cookies.get('lives')
  
    const cookiesLost = Cookies.get('lost')

    const cookiesGuessed = Cookies.get('guessedLetters')

    const cookiesGuessedWord = Cookies.get('guessedWord')

      
    
    return (
      <div className="App">

      
        
        <pre>{getHangmanDrawing(cookiesLives)}</pre>
        <p>Word: {cookiesGuessedWord}</p>
        <p>Lives: {renderHearts(cookiesLives)}</p>
        <p>Guessed Letters: {cookiesGuessed}</p>

        {/* Keyboard */}
        <div className="keyboard">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={guessedLetters.includes(letter) || gameOver || !canPlay}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Game Over / Win Screen */}
        {
          <div className="result">
            {!cookiesLost ? (
              <h2>Congratulations, You Won!</h2>
            ) : (
              <h2>Game Over! You Lost</h2>
            )}
            <p>The word was: {word}</p>

            <button className="share-button" onClick={shareResult}>Share Result</button>
            
            
          </div>
        }

        {/* If game is already completed today */}
        {!canPlay && <p>You've already played today!</p>}

        {/* <button className="share-button" onClick={shareResult}>Share Result</button> */}
        
        
        {/* Display statistics */}
        {getStatistics()}
        
        
      </div>
    );
  }}

// Keyboard Component to render letter buttons
const Keyboard = ({ guessedLetters, onLetterClick }) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
    return (
        <div className="keyboard">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            disabled={guessedLetters.includes(letter)} // Disable the button if the letter has been guessed
          >
            {letter}
          </button>
        ))}
      </div>
    );
  };

  const wordList = [
    "MINING", "IGNORE", "MUSEUM", "DOUBLE", "HOTELS", "HEALTH", "GIVING", "ANYONE", "MASTER", "MIRROR",
    "BALANCE", "BANNER", "GARDEN", "HARDLY", "KITCHEN", "FAMILY", "CANNOT", "HUNTER", "FORMER", "LIBERTY",
    "ATTEND", "FINGER", "CLOVER", "CIRCLE", "HEAVEN", "GROUND", "FROZEN", "MOVING", "GUILTY", "LETTER",
    "HEIGHT", "KINGLY", "FLOWER", "JOURNY", "MINUTE", "MONKEY", "HONEST", "MAGNET", "BORDER", "GALAXY",
    "BEFORE", "DOUBTS", "KNIGHT", "DOCTOR", "LEADER", "CORNER", "ESCAPE", "CENTER", "DOUBTS", "BUTTON",
    "KIDNEY", "ADVICE", "LASTED", "LIVING", "COMPLEX", "MIGHTY", "EATING", "LADDER", "CREDIT", "MEMORY",
    "LOVELY", "HIDDEN", "MASTER", "JUMPED", "ATTACK", "MOMENT", "COMMON", "FREELY", "MATTER", "CLIENT",
    "EMPIRE", "MOBILE", "ACTIVE", "AUTHOR", "BARREL", "CHOICE", "FUTURE", "MURDER", "DETAIL", "FAIRLY",
    "BEACON", "CANDLE", "BENEATH", "JACKET", "MEDIUM", "ARCHER", "APPLIED", "COTTON", "ASYNIC", "CORNER",
    "ADVENT", "INSIDE", "APPEAL", "COMPLEX", "MEDIUM", "BASKET", "HONEST", "LONGER", "LIQUID", "CREDIT",
    "ESCAPE", "MOBILE", "AUTUMN", "HEAVEN", "GLANCE", "IMPACT", "MIDDLE", "REACT", "JOKING", "ALMOND",
    "LISTEN", "DESIRE", "CLIENT", "MOVING", "DESIGN", "EITHER", "BOUGHT", "IMPORT", "LEADER", "MORALS",
    "INSIDE", "DANCER", "BOTTLE", "DRIVER", "VOLUME", "FAIRLY", "EATING", "ASSET", "MASTER", "LIQUID",
    "ATTACK", "BORDER", "DRAGON", "LISTEN", "MINING", "BRIDGE", "ENORMOUS", "HEALTH", "LIGHTER", "DOCTOR",
    "ACTIVE", "HOTELS", "SILENT", "BANNER", "IGNORE", "FUTURE", "DESIGN", "MARKET", "EXISTS", "IGNORE",
    "ATTACK", "BRANCH", "EDITOR", "ENGINE", "DETAIL", "ANSWER", "FINGER", "FAMILY", "AUTHOR", "CREATE",
    "FIGURE", "COFFEE", "BARREL", "CANNOT", "GENDER", "CORNER", "HORROR", "MASTER", "COMPLEX", "HARDLY",
    "IMPACT", "EXISTS", "EITHER", "LIBERTY", "FUTURE", "ASSET", "ADVICE", "INSIDE", "MURDER", "LASTED",
    "MURDER", "MOVING", "MINUTE", "BEACON", "BENEATH", "FUTURE", "ENGINE", "DESIRE", "MASTER", "KITTEN",
    "HARDLY", "GOVERN", "MOMENT", "BORDER", "LOVELY", "BUTTON", "IGNORE", "BOUGHT", "FORCES", "BRIDGE",
    "CREATE", "BUTTON", "MUSEUM", "FORCES", "MASTER", "FORMER", "CORNER", "MOBILE", "ANYONE", "CANNOT",
    "BAKING", "LIGHTER", "CIRCLE", "BRANCH", "FORCES", "COFFEE", "EMPIRE", "ANYONE", "EXISTS", "FAMILY",
    "ACTIVE", "CORNER", "DOCTOR", "HONEST", "GARDEN", "BORDER", "COMPLEX", "CLIENT", "KNIGHT", "FAMILY",
    "MEDIUM", "BOUGHT", "MASTER", "CLIENT", "MASTER", "ESCAPE", "MINUTE", "MASTER", "ESCAPE", "CANNOT",
    "MASTER", "HUNTER", "MORALS", "ASYNIC", "ARCHER", "CREATE", "BALANCE", "MASTER", "DETAIL", "MASTER",
    "FAMILY", "HARDLY", "MASTER", "DETAIL", "MASTER", "AUTHOR", "MASTER", "LOVELY", "BALANCE", "ACTIVE",
    "CORNER", "MASTER", "CORNER", "CREDIT", "DETAIL", "MASTER", "JOKING", "IGNORE", "BALANCE", "AUTHOR",
    "MASTER", "LASTED", "IGNORE", "MASTER", "MASTER", "AUTHOR", "MASTER", "MASTER", "MASTER", "MASTER",
    "LIGHTER", "IGNORE", "FAIRLY", "AUTHOR", "MASTER", "MASTER", "MASTER", "MASTER", "MASTER", "MASTER"
  ];

  // Function to calculate the day of the year (1-365 or 1-366 for leap years)
const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0); // Start of the year
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Function to get the word of the day based on the current date
const getDailyWord = () => {
  const dayOfYear = getDayOfYear();
  const wordIndex = dayOfYear % wordList.length; // Cycle through word list
  return wordList[wordIndex];
};



export default Hangman;