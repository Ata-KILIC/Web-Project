import React, { useState } from 'react';
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

    const handleKeyPress = (key) => {
        if (currentPosition >= WORD_LENGTH) return;
        
        const newBoard = [...board];
        newBoard[currentAttempt][currentPosition] = key;
        setBoard(newBoard);
        setCurrentPosition(currentPosition + 1);
    };

    const handleEnter = () => {
        if (currentPosition !== WORD_LENGTH) return;
        
        if (currentAttempt < MAX_ATTEMPTS - 1) {
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

    return (
        <div className="wordle-container">
            <div className="game-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((letter, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} className="board-tile">
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
            />
        </div>
    );
};

export default Wordle; 