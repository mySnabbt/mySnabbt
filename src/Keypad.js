import React from 'react';
import './Keypad.css';

function Keypad({ quantity, setQuantity, decimal = false }) {
  const handleKeyPress = (value) => {
    if (value === 'Clear') {
      setQuantity("0");
    } else if (value === 'Enter') {
      return;
    } else if (value === '.') {
      const s = String(quantity ?? "");
      if (!s.includes('.')) {
        setQuantity(s.length ? s + '.' : '0.');
      }
    } else {
      const s = String(quantity ?? "0");
      if (s === "0" && value !== '.' && !s.includes('.')) {
        setQuantity(value);
      } else {
        setQuantity(s + value);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {['1','2','3','4','5','6','7','8','9'].map((num) => (
        <button key={num} onClick={() => handleKeyPress(num)} className="rounded-md border px-3 py-2">
          {num}
        </button>
      ))}
      {decimal && (
        <button onClick={() => handleKeyPress('.')} className="rounded-md border px-3 py-2">.</button>
      )}
      <button onClick={() => handleKeyPress('0')} className="rounded-md border px-3 py-2">0</button>
      <button onClick={() => handleKeyPress('Clear')} className="rounded-md border px-3 py-2">Clear</button>
      <button onClick={() => handleKeyPress('Enter')} className="rounded-md border px-3 py-2 col-span-3">Enter</button>
    </div>
  );
}

export default Keypad;
