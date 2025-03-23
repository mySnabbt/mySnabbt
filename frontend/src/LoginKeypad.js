import React from 'react';
import './LoginKeypad.css';


function LoginKeypad({user, setUser, pass, setPass, userActive, passActive}) {
    const handleKeyPress = (number) => {
        if (userActive===true) {
            if (number === 'Clear') {
                setUser(0);
            } else if (number === 'Enter') {
                // Enter is handled when adding items
            } else {
                setUser(parseInt(`${user}${number}`, 10));
            }
        }else if (passActive===true) {
            if (number === 'Clear') {
                setPass(0);
            } else if (number === 'Enter') {
                // Enter is handled when adding items
            } else {
                setPass(parseInt(`${pass}${number}`, 10));
            }
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
export default LoginKeypad;



