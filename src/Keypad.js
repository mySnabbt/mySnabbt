// import React from 'react';
// import './Keypad.css';

// function Keypad({quantity, setQuantity, decimal = false}) {
//     const handleKeyPress = (number) => {
//         if (number === 'Clear') {
//             setQuantity(0);
//         } else if (number === 'Enter') {
//             // Enter is handled when adding items
//         } else {
//             setQuantity(parseInt(`${quantity}${number}`, 10));
//         }
//     };

//     return (
//         <div className="keypad">
//             {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Enter'].map((num) => (
//                 <button key={num} onClick={() => handleKeyPress(num)} className="keypad-button">
//                     {num}
//                 </button>

//             ))}
//         </div>
//     );
// }

// export default Keypad;

import React from 'react';
import './Keypad.css';

function Keypad({ quantity, setQuantity, decimal = false }) { // Renamed from 'includeDecimal' to 'decimal' as per your code
    const handleKeyPress = (value) => {
        if (value === 'Clear') {
            setQuantity(0); // Resets to 0
        } else if (value === 'Enter') {
            // 'Enter' is typically handled by a parent component
        } else if (value === '.') {
            const currentQuantityString = String(quantity);
            // Only add decimal if it's not already there
            if (!currentQuantityString.includes('.')) {
                // If current value is 0, start with "0."
                if (currentQuantityString === '0') {
                    setQuantity('0.');
                } else {
                    setQuantity(currentQuantityString + '.');
                }
            }
        } else {
            // For numbers 0-9
            const currentQuantityString = String(quantity);

            // Prevent multiple leading zeros (e.g., 000)
            if (currentQuantityString === '0' && value === '0') {
                setQuantity(0);
            }
            // If currently '0' and a non-zero number is pressed (and no decimal), replace '0'
            else if (currentQuantityString === '0' && value !== '0' && !currentQuantityString.includes('.')) {
                setQuantity(parseInt(value, 10));
            }
            // Append the new digit
            else {
                const newQuantityString = currentQuantityString + value;
                // If the new string contains a decimal, keep it as a string
                if (newQuantityString.includes('.')) {
                    setQuantity(newQuantityString);
                } else {
                    // Otherwise, parse as an integer
                    setQuantity(parseInt(newQuantityString, 10));
                }
            }
        }
    };

    return (
        <div className="keypad">
            {/* Numbers 1-9 */}
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button key={num} onClick={() => handleKeyPress(num)} className="keypad-button">
                    {num}
                </button>
            ))}
            {/* Conditionally render the decimal button */}
            {decimal && (
                <button key="." onClick={() => handleKeyPress('.')} className="keypad-button">
                    .
                </button>
            )}
            {/* Number 0 */}
            <button key="0" onClick={() => handleKeyPress('0')} className="keypad-button">
                0
            </button>
            {/* Clear and Enter buttons */}
            <button key="Clear" onClick={() => handleKeyPress('Clear')} className="keypad-button">
                Clear
            </button>
            <button key="Enter" onClick={() => handleKeyPress('Enter')} className="keypad-button">
                Enter
            </button>
        </div>
    );
}

export default Keypad;