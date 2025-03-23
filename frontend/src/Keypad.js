import React from 'react';
import './Keypad.css';


function Keypad({quantity, setQuantity}) {
    const handleKeyPress = (number) => {
        if (number === 'Clear') {
            setQuantity(0);
        } else if (number === 'Enter') {
            // Enter is handled when adding items
        } else {
            setQuantity(parseInt(`${quantity}${number}`, 10));
        }
    };


    return (
        <div className="keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Enter'].map((num) => (
                <button key={num} onClick={() => handleKeyPress(num)} className="keypad-button">
                    {num}
                </button>


            ))}
        </div>
    );
}


export default Keypad;



