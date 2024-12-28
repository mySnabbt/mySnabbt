import React from 'react';
import './PaymentWindow.css';

function PaymentWindow({ closePaymentWindow }) {
    return (
        <div className="payment-window">
            <h2>Payment</h2>
            <button onClick={closePaymentWindow} className='close-button'> X </button>
        </div>
    );
}

export default PaymentWindow;