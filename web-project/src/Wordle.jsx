import React, { useState, useEffect } from 'react';
import './Wordle.css';
import Keyboard from './Keyboard';

const Wordle = () => {
    const DEFAULT_MAX_ATTEMPTS = 6;
    const DEFAULT_WORD_LENGTH = 5;

    const [maxAttempts, setMaxAttempts] = useState(DEFAULT_MAX_ATTEMPTS);
    const [wordLength, setWordLength] = useState(DEFAULT_WORD_LENGTH);
    const [currentAttempt, setCurrentAttempt] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [board, setBoard] = useState(() => Array(DEFAULT_MAX_ATTEMPTS).fill().map(() => Array(DEFAULT_WORD_LENGTH).fill('')));
    const [targetWord, setTargetWord] = useState('');
    const [gameStatus, setGameStatus] = useState('playing');
    const [letterStates, setLetterStates] = useState({});
    const [shake, setShake] = useState(false);
    const [evaluations, setEvaluations] = useState(() => Array(DEFAULT_MAX_ATTEMPTS).fill(null));

    // Statistics state
    const [streak, setStreak] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [gamesPlayed, setGamesPlayed] = useState(0);

    // Initialize board
    const initializeBoard = () => {
        const newBoard = Array(maxAttempts).fill().map(() => Array(wordLength).fill(''));
        const newEvaluations = Array(maxAttempts).fill(null);
        setBoard(newBoard);
        setEvaluations(newEvaluations);
        setCurrentAttempt(0);
        setCurrentPosition(0);
    };

    // Load statistics from localStorage
    useEffect(() => {
        const savedStats = localStorage.getItem('wordleStats');
        if (savedStats) {
            const { streak, gamesWon, gamesPlayed } = JSON.parse(savedStats);
            setStreak(streak);
            setGamesWon(gamesWon);
            setGamesPlayed(gamesPlayed);
        }
        fetchNewWord(); // Initial word fetch
    }, []);

    // Save statistics to localStorage
    useEffect(() => {
        localStorage.setItem('wordleStats', JSON.stringify({
            streak,
            gamesWon,
            gamesPlayed
        }));
    }, [streak, gamesWon, gamesPlayed]);

    const resetGame = async () => {
        setLetterStates({});
        setGameStatus('playing');
        initializeBoard();
        await fetchNewWord();
    };

    const fetchNewWord = async () => {
        try {
            const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${wordLength}`);
            const [word] = await response.json();
            setTargetWord(word.toUpperCase());
        } catch (error) {
            console.error('Error fetching word:', error);
            setTargetWord('REACT'.slice(0, wordLength).padEnd(wordLength, 'X'));
        }
    };

    // Handle settings changes
    const handleSettingChange = (setting, value) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        if (setting === 'maxAttempts' && numValue >= 1 && numValue <= 12) {
            setMaxAttempts(numValue);
        } else if (setting === 'wordLength' && numValue >= 3 && numValue <= 8) {
            setWordLength(numValue);
        }
    };

    // Update board when settings change
    useEffect(() => {
        initializeBoard();
        fetchNewWord();
    }, [maxAttempts, wordLength]);

    const isValidWord = (word) => {
        return word.length === wordLength;
    };

    const evaluateGuess = (guess) => {
        const evaluation = Array(wordLength).fill('absent');
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');
        
        guessLetters.forEach((letter, i) => {
            if (letter === targetLetters[i]) {
                evaluation[i] = 'correct';
                targetLetters[i] = null;
            }
        });

        guessLetters.forEach((letter, i) => {
            if (evaluation[i] !== 'correct') {
                const targetIndex = targetLetters.indexOf(letter);
                if (targetIndex !== -1) {
                    evaluation[i] = 'present';
                    targetLetters[targetIndex] = null;
                }
            }
        });

        return evaluation;
    };

    const updateLetterStates = (guess, evaluation) => {
        const newStates = { ...letterStates };
        guess.split('').forEach((letter, index) => {
            const currentState = newStates[letter];
            const newState = evaluation[index];
            
            if (!currentState || 
                (currentState === 'absent' && newState !== 'absent') ||
                (currentState === 'present' && newState === 'correct')) {
                newStates[letter] = newState;
            }
        });
        setLetterStates(newStates);
    };

    const handleKeyPress = (key) => {
        if (gameStatus !== 'playing' || 
            currentPosition >= wordLength || 
            !board || 
            !board[currentAttempt]) return;
        
        const newBoard = [...board];
        if (newBoard[currentAttempt] && newBoard[currentAttempt][currentPosition] !== undefined) {
            newBoard[currentAttempt][currentPosition] = key;
            setBoard(newBoard);
            setCurrentPosition(currentPosition + 1);
        }
    };

    const handleEnter = () => {
        if (currentPosition !== wordLength || !board || !board[currentAttempt]) return;
        
        const guess = board[currentAttempt].join('');
        
        if (!isValidWord(guess)) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        const evaluation = evaluateGuess(guess);
        const newEvaluations = [...evaluations];
        newEvaluations[currentAttempt] = evaluation;
        setEvaluations(newEvaluations);
        
        updateLetterStates(guess, evaluation);

        if (guess === targetWord) {
            setGameStatus('won');
            setGamesWon(prev => prev + 1);
            setStreak(prev => prev + 1);
            setGamesPlayed(prev => prev + 1);
        } else if (currentAttempt === maxAttempts - 1) {
            setGameStatus('lost');
            setStreak(0);
            setGamesPlayed(prev => prev + 1);
        } else {
            setCurrentAttempt(currentAttempt + 1);
            setCurrentPosition(0);
        }
    };

    const handleDelete = () => {
        if (currentPosition === 0 || !board || !board[currentAttempt]) return;

        const newBoard = [...board];
        if (newBoard[currentAttempt] && newBoard[currentAttempt][currentPosition - 1] !== undefined) {
            newBoard[currentAttempt][currentPosition - 1] = '';
            setBoard(newBoard);
            setCurrentPosition(currentPosition - 1);
        }
    };

    useEffect(() => {
        const handleKeydown = (event) => {
            if (gameStatus !== 'playing') return;
            
            const key = event.key.toUpperCase();
            
            if (
                /^[A-Z]$/.test(key) || 
                key === 'ENTER' || 
                key === 'BACKSPACE'
            ) {
                event.preventDefault();
            }

            if (/^[A-Z]$/.test(key)) {
                handleKeyPress(key);
            } else if (key === 'ENTER') {
                handleEnter();
            } else if (key === 'BACKSPACE') {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [currentAttempt, currentPosition, gameStatus, wordLength, maxAttempts]);

    return (
        <div className="wordle-container">
            <div className="game-settings">
                <div className="setting-input">
                    <label htmlFor="maxAttempts">Max Attempts</label>
                    <input
                        id="maxAttempts"
                        type="number"
                        min="1"
                        max="12"
                        value={maxAttempts}
                        onChange={(e) => handleSettingChange('maxAttempts', e.target.value)}
                    />
                </div>
                <div className="setting-input">
                    <label htmlFor="wordLength">Word Length</label>
                    <input
                        id="wordLength"
                        type="number"
                        min="3"
                        max="8"
                        value={wordLength}
                        onChange={(e) => handleSettingChange('wordLength', e.target.value)}
                    />
                </div>
            </div>

            <div className="stats-panel">
                <div className="stat-item">
                    <span>🔥</span>
                    <span className="streak-count">{streak}</span>
                </div>
                <div className="stat-item">
                    <span className="win-ratio">{gamesWon}</span>
                    <span>/</span>
                    <span>{gamesPlayed}</span>
                </div>
            </div>

            <div className="game-controls">
                <button className="new-game-btn" onClick={resetGame}>
                    New Game
                </button>
            </div>

            {gameStatus !== 'playing' && (
                <div className="game-message">
                    {gameStatus === 'won' ? 'Congratulations!' : `The word was: ${targetWord}`}
                </div>
            )}
            <div className="game-board">
                {board.map((row, rowIndex) => (
                    <div 
                        key={rowIndex} 
                        className={`board-row ${rowIndex === currentAttempt && shake ? 'shake' : ''}`}
                    >
                        {row.map((letter, colIndex) => (
                            <div 
                                key={`${rowIndex}-${colIndex}`} 
                                className={`board-tile ${
                                    evaluations[rowIndex] ? 
                                    `tile-${evaluations[rowIndex][colIndex]}` : 
                                    letter ? 'tile-filled' : ''
                                }`}
                            >
                                {letter}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <Keyboard 
                onKeyPress={handleKeyPress}
                onEnter={handleEnter}
                onDelete={handleDelete}
                letterStates={letterStates}
            />
        </div>
    );
};

export default Wordle; 