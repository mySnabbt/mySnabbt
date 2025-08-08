import React from 'react';
import './LoginKeypad.css';

function LoginKeypad({ user, setUser, pass, setPass, userActive, passActive }) {
  const handleKeyPress = (number) => {
    if (userActive === true) {
      if (number === 'Clear') {
        setUser("");
      } else if (number === 'Enter') {
        // handled by parent
      } else {
        setUser(`${user || ""}${number}`);
      }
    } else if (passActive === true) {
      if (number === 'Clear') {
        setPass("");
      } else if (number === 'Enter') {
        // handled by parent
      } else {
        setPass(`${pass || ""}${number}`);
      }
    }
  };

  return (
    <div className="keypad">
      {['1','2','3','4','5','6','7','8','9','Clear','0','Enter'].map((num) => (
        <button key={num} onClick={() => handleKeyPress(num)} className="keypad-button">
          {num}
        </button>
      ))}
    </div>
  );
}

export default LoginKeypad;
