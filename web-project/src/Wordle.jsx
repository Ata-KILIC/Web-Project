import React, { useState, useEffect } from 'react';
import './Wordle.css';
import Keyboard from './Keyboard';

const Wordle = () => {
    // Number of attempts allowed
    const MAX_ATTEMPTS = 6;
    // Word length
    const WORD_LENGTH = 5;

    // State for current attempt and guesses
    const [currentAttempt, setCurrentAttempt] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [board, setBoard] = useState(Array(MAX_ATTEMPTS).fill().map(() => Array(WORD_LENGTH).fill('')));
    const [targetWord, setTargetWord] = useState('');
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
    const [letterStates, setLetterStates] = useState({}); // Track letter colors for keyboard
    const [shake, setShake] = useState(false); // For invalid word animation
    const [evaluations, setEvaluations] = useState(Array(MAX_ATTEMPTS).fill(null)); // Store letter evaluations

    // Fetch target word on component mount
    useEffect(() => {
        const fetchWord = async () => {
            try {
                const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
                const [word] = await response.json();
                setTargetWord(word.toUpperCase());
            } catch (error) {
                console.error('Error fetching word:', error);
                // Fallback word in case API fails
                setTargetWord('REACT');
            }
        };
        fetchWord();
    }, []);

    // Validate if word exists (you can expand this with a dictionary API)
    const isValidWord = (word) => {
        // For now, accept any 5-letter combination
        // You can enhance this by checking against a dictionary API
        return word.length === WORD_LENGTH;
    };

    const evaluateGuess = (guess) => {
        const evaluation = Array(WORD_LENGTH).fill('absent');
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');
        
        // First pass: mark correct positions
        guessLetters.forEach((letter, i) => {
            if (letter === targetLetters[i]) {
                evaluation[i] = 'correct';
                targetLetters[i] = null;
            }
        });

        // Second pass: mark present letters
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
        if (gameStatus !== 'playing' || currentPosition >= WORD_LENGTH) return;
        
        const newBoard = [...board];
        newBoard[currentAttempt][currentPosition] = key;
        setBoard(newBoard);
        setCurrentPosition(currentPosition + 1);
    };

    const handleEnter = () => {
        if (currentPosition !== WORD_LENGTH) return;
        
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
        } else if (currentAttempt === MAX_ATTEMPTS - 1) {
            setGameStatus('lost');
        } else {
            setCurrentAttempt(currentAttempt + 1);
            setCurrentPosition(0);
        }
    };

    const handleDelete = () => {
        if (currentPosition === 0) return;

        const newBoard = [...board];
        newBoard[currentAttempt][currentPosition - 1] = '';
        setBoard(newBoard);
        setCurrentPosition(currentPosition - 1);
    };

    // Handle physical keyboard events
    useEffect(() => {
        const handleKeydown = (event) => {
            const key = event.key.toUpperCase();
            
            // Prevent default behavior for game-related keys
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

        // Add event listener
        window.addEventListener('keydown', handleKeydown);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [currentAttempt, currentPosition, gameStatus]); // Dependencies for the useEffect hook

    return (
        <div className="wordle-container">
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