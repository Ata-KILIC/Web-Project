import React from 'react';
import './Keyboard.css';

const Keyboard = ({ onKeyPress, onEnter, onDelete }) => {
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];

    const handleClick = (key) => {
        if (key === 'ENTER') {
            onEnter();
        } else if (key === '⌫') {
            onDelete();
        } else {
            onKeyPress(key);
        }
    };

    return (
        <div className="keyboard">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map((key) => (
                        <button
                            key={key}
                            className={`keyboard-key ${key === 'ENTER' || key === '⌫' ? 'wide-key' : ''}`}
                            onClick={() => handleClick(key)}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Keyboard; 